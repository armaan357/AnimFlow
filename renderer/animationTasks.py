from  animationWorker import celeryApp
import os
import subprocess
import shutil
from datetime import datetime
import time
import requests
import json
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader

load_dotenv()

serviceSecret = os.getenv("INTERNAL_SERVICE_SECRET")
internalServiceURL = os.getenv("INTERNAL_SERVICE_URL")

cloudinary.config(
    cloud_name = os.getenv('CLOUD_NAME'),
    api_key = os.getenv('API_KEY'),
    api_secret = os.getenv('API_SECRET')
)

videoQualityToResolution = { "l": "480p15", "m": "720p30", "h": "1080p60" }

def validateOutput(returnCode: int, animationFileAddress: str):
    if returnCode != 0:
        return { "res": False, "reason": "RENDER_PROCESS_FAILED" }

    if not os.path.isfile(animationFileAddress):
        return { "res": False, "reason": "OUTPUT_NOT_FOUND"}

    if not os.path.getsize(animationFileAddress) > 20000:
        return { "res": False, "reason": "EMPTY_OR_CORRUPT_OUTPUT"}

    
    # implement conditions to verify that the video duration > 0 and less than a certain time for eg: 50s
    # implement conditions to verify the resolution of the video 
    return { "res": True }

def cleanUpLogic(folderPath: str, videoResolution: str, filePath: str):
    try:
        os.remove(filePath)

        imageFolderPath = os.path.join(folderPath, "media", "images")

        partialFolderPath = os.path.join(folderPath, "media", "videos", "animation", videoResolution, "partial_movie_files")

        if os.path.exists(imageFolderPath):
            shutil.rmtree(imageFolderPath)

        if  os.path.exists(partialFolderPath):
            shutil.rmtree(partialFolderPath)

        print(f"Removed images directory and partial movie files from folder: {folderPath}")

    except Exception as e:
        print(e)

def upload_video(file_path, public_id_name=None):
    """
    Uploads a video to Cloudinary. Uses upload_large for files > 100 MB.
    """
    try:
        # Determine the upload method based on file size if necessary, 
        # or use upload_large by default for potential large video files.
        # The upload_large method handles chunking automatically.
        response = cloudinary.uploader.upload_large(
            file_path,
            resource_type="video", # Must specify resource_type="video"
            public_id=public_id_name,
        )
        
        print(f"Upload successful. Secure URL: {response['secure_url']}")
        print(f"Public ID: {response['public_id']}")
        return response

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

@celeryApp.task(name="generateAnimation", bind=True, max_retries=5, time_limit=100)
def generateAnimation(self, newJob: dict):
    folderPath = None
    filePath = None
    videoResolution = None
    result = None
    animationId = newJob.get("id")
    print(f"\n\n\ndot env var = {serviceSecret}\n\n\n")

    try:
        jobId = self.request.id
        print(f"[{jobId}] Job started")
        if not newJob.get("code"):
            result = { 
                "id": jobId,
                "status": "FAILED",
                "Reason": "No_Code_Found",
                "timeStamp": datetime.now().isoformat()
            }
            return result
        currWorkingDir = os.getcwd()
        folderPath = os.path.join(currWorkingDir, "tmp", "jobs", jobId)
        os.makedirs(folderPath, exist_ok=True)

        filePath = os.path.join(folderPath, "animation.py")
        
        with open(filePath, "w") as f:
            f.write(newJob.get("code"))

        normalizedCwd = folderPath.replace('\\', '/').replace(':', '')  #might not be required after deploying

        if not normalizedCwd.startswith('/'):
            normalizedCwd = '/' + normalizedCwd

        videoQuality = newJob.get('resolution') if newJob.get('resolution') else 'l'

        videoResolution = videoQualityToResolution.get(videoQuality, '480p15')
        # videoResolution = '480p15'
        
        command = ['docker', 
                  'run',
                  '--rm', 
                  '--network', 'none',
                  '--memory-reservation=512m',
                  '--memory=768m',
                  '--cpus=0.5',
                  '--user', '1000:1000',
                  '-v', f'{normalizedCwd}:/manim',
                  'manimcommunity/manim',
                  'manim', 
                  'animation.py', 
                  'GeneratedScene',
                  f'-q{videoQuality}'
                # '-ql'
                ]
        
        # command uses a throwaway docker container and renders a cleaner animation in the same directory as the code, but maybe only works on windows and might not work on linux devices

        print(f"[{jobId}] Starting docker render...")
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8', timeout=240)
        if result.stderr:
            print(f"\n\n\nError:\n\n {result.stderr}")
        print(f"[{jobId}] Docker finished | exit={result.returncode}")

        animationFileAddress = os.path.join(folderPath, "media", "videos", "animation", videoResolution, "GeneratedScene.mp4")
        print(f"\n\n\n\nAnimation File Address = {animationFileAddress}\n\n\n\n")
        
        isValidOutput = validateOutput(returnCode=result.returncode, animationFileAddress=animationFileAddress)
        print(f"[{jobId}] Output validation: {isValidOutput}")

        if not isValidOutput["res"]:
            result = {
                "id": jobId,
                "animationId": animationId,
                "status": "FAILED",
                "Reason": isValidOutput["reason"],
                "timeStamp": datetime.now().isoformat()
            }
        else:
            upload_res = upload_video(animationFileAddress, f"{jobId}")
            print(f"\n\n\nupload response = {upload_res}\n\n\n")
            result= {
                "id": jobId,
                "animationId": animationId,
                "status": "COMPLETED",
                "videoURL": upload_res.get("secure_url"),
                "timestamp": datetime.now().isoformat()
            }

        print(f"[{jobId}] Final result: {result['status']} | Reason: {result.get('Reason', 'Reason Not Found')}")
        return result

    except subprocess.TimeoutExpired as t_err:
        print(f"[{jobId}] TIMEOUT after 240s")
        result = {
                "id": jobId,
                "animationId": animationId,
                "status": "FAILED",
                "Reason": "TIMEOUT",
                "Error": t_err.stderr[-500:],
                "timeStamp": datetime.now().isoformat()
            }
        return result
    
    except subprocess.CalledProcessError as err:
        print(f"[{jobId}] Subprocess error")
        result = {
            "id": jobId,
            "animationId": animationId,
            "status": "FAILED",
            "Reason": "subprocessError",
            "Error": err.stderr[-500:],
            "timeStamp": datetime.now().isoformat()
        }
        num_retries = generateAnimation.request.retries
        seconds_to_wait = 2 ** num_retries
        raise generateAnimation.retry(countdown=seconds_to_wait)
    

    except OSError as e:
        result = {
            "id": jobId,
            "animationId": animationId,
            "status": "FAILED",
            "Reason": "OSError",
            "Error": str(e),
            "timeStamp": datetime.now().isoformat()
        }
        print(result)
        return

    finally:
        if folderPath is None or filePath is None or videoResolution is None or result is None:
            return
        cleanUpLogic(folderPath, videoResolution, filePath)
        print(f"[{jobId}] Cleanup complete")
        if not internalServiceURL:
            print("Internal Service URL not found")
            return
        response = requests.post(internalServiceURL, headers={ 'service_secret': serviceSecret},json = result)
        if response.status_code == 200:
            pretty_data = json.dumps(response.json(), indent=4, sort_keys=True)
            print("\nPretty printed data:")
            print(pretty_data)
        else:
            print(f"Error: Received status code {response.status_code}")
            print(f"Response text: {response.text}")
        return

@celeryApp.task(name="storeAnimation")
def storeAnimation():
    time.sleep(5)
    print("animation stored successfuly")

    result= {"status": "completed", "task": "stored animation"}

    return result