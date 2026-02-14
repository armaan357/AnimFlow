from fastapi import FastAPI
from pydantic import BaseModel
from celery.result import AsyncResult
from animationWorker import celeryApp
from animationTasks import generateAnimation, storeAnimation
import ast

ALLOWED_ROOT_MODULE = "manim"
FORBIDDEN_CALLS = {
    "exec",
    "eval",
    "compile",
    "open",
    "__import__"
}

FORBIDDEN_ATTRS = {
    "system",
    "popen",
    "run",
    "call",
    "remove",
    "unlink"
}


class CustomCodeValidator(ast.NodeVisitor):
    def __init__(self):
        self.errors = []
        self.scene_classes = []

    def visit_ClassDef(self, node):
        is_scene = False

        for base in node.bases:
            if isinstance(base, ast.Name) and base.id == "Scene":
                is_scene = True
            elif isinstance(base, ast.Attribute) and base.attr == "Scene":
                is_scene = True

        if is_scene:
            self.scene_classes.append(node)

            has_construct = any(
                isinstance(item, ast.FunctionDef) and item.name == "construct"
                for item in node.body
            )

            if not has_construct:
                self.errors.append(
                    f"Scene class '{node.name}' missing construct() method (line {node.lineno})"
                )

        else:
            self.errors.append(
                f"Non-Scene class '{node.name}' detected (line {node.lineno})"
            )

        self.generic_visit(node)

    def visit_Import(self, node):
        for alias in node.names:
            if not (
                alias.name == ALLOWED_ROOT_MODULE
                or alias.name.startswith(f"{ALLOWED_ROOT_MODULE}.")
            ):
                self.errors.append(
                    f"Illegal import '{alias.name}' at line {node.lineno}"
                )
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if node.module is None:
            self.errors.append(
                f"Relative import not allowed (line {node.lineno})"
            )
        elif not (
            node.module == ALLOWED_ROOT_MODULE
            or node.module.startswith(f"{ALLOWED_ROOT_MODULE}.")
        ):
            self.errors.append(
                f"Illegal import from '{node.module}' at line {node.lineno}"
            )
        self.generic_visit(node)

    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            if node.func.id in FORBIDDEN_CALLS:
                self.errors.append(
                    f"Forbidden call '{node.func.id}' at line {node.lineno}"
                )
        elif isinstance(node.func, ast.Attribute):
            if node.func.attr in FORBIDDEN_ATTRS:
                self.errors.append(
                    f"Forbidden attribute call '{node.func.attr}' at line {node.lineno}"
                )

        self.generic_visit(node)

    def visit_While(self, node):
        if isinstance(node.test, ast.Constant) and node.test.value is True:
            self.errors.append(
                f"Infinite while-loop detected at line {node.lineno}"
            )
        self.generic_visit(node)

    def validate(self, tree):
        self.visit(tree)

        if len(self.scene_classes) == 0:
            self.errors.append("No Scene class found")

        if len(self.scene_classes) > 1:
            self.errors.append("More than one Scene class found")

        return self.errors


class jobReq(BaseModel) :
    id: str
    prompt: str
    code: str
    fps: int
    resolution: str

app = FastAPI()

@app.get("/")
def home():
    return {'message': 'hello'}

@app.post("/job")
def publishJob(newJob: jobReq):
    
    try:
        code = newJob.code
        parseTree = ast.parse(code)
        validator = CustomCodeValidator()

        validator.visit(parseTree)
        task = generateAnimation.delay(newJob.dict())
        print(f"task =\n\n{task}")

        return {
            "taskId": task.id,
            "status": "Task Submitted",
            "message": "Use /task/{task_id} to check status"
        }

    except SyntaxError as e:
        print(f"SyntaxError: {e}")

@app.get("/task/{task_id}")
def get_task_status(task_id: str):
    """
    Check the status of a Celery task.
    """
    task_result = AsyncResult(task_id, app=celeryApp)
    
    if task_result.state == "PENDING":
        response = {
            "taskId": task_id,
            "state": task_result.state,
            "status": "Task is waiting to be executed"
        }
    elif task_result.state == "STARTED":
        response = {
            "taskId": task_id,
            "state": task_result.state,
            "status": "Task is currently running"
        }
    elif task_result.state == "SUCCESS":
        response = {
            "taskId": task_id,
            "state": task_result.state,
            "result": task_result.result
        }
    elif task_result.state == "FAILURE":
        response = {
            "taskId": task_id,
            "state": task_result.state,
            "error": str(task_result.info)
        }
    else:
        response = {
            "task_id": task_id,
            "state": task_result.state
        }
    
    return response

@app.get("/tasks/active")
def get_active_tasks():
    """
    Get list of currently active tasks.
    """
    inspect = celeryApp.control.inspect()
    active_tasks = inspect.active()
    
    return {
        "active_tasks": active_tasks
    }


# from manim import *

# class CircleToSquareArrow(Scene):
#     def construct(self):
#         # 1. Create the Mobjects (Shapes)

#         # Red Circle
#         # We'll make it a decent size and place it on the left
#         circle = Circle(radius=0.8, color=RED, fill_opacity=1)
#         circle.shift(1 * LEFT) # Move it 3 units to the left from the center

#         # Blue Square
#         # Make it slightly larger for visual distinction and place it on the right
#         square = Square(side_length=1.5, color=BLUE, fill_opacity=1)
#         square.shift(2 * RIGHT) # Move it 3 units to the right from the center

#         # Add a title for context
#         title = Text("Arrow from Circle to Square", font_size=48).to_edge(UP)

#         # 2. Animate the appearance of the shapes and title
#         self.play(
#             FadeIn(title, shift=UP),
#             FadeIn(circle, shift=DOWN), # Make circle slide in from bottom
#             FadeIn(square, shift=DOWN), # Make square slide in from bottom
#             run_time=1.5 # Make this initial fade-in a bit slower
#         )
#         self.wait(0.5) # Pause briefly

#         # 3. Create the Arrow
#         # We want the arrow to go from the RIGHT edge of the circle
#         # to the LEFT edge of the square.
#         # `buff` adds a small gap between the arrow and the mobject.
#         arrow = Arrow(
#             start=circle.get_right(),
#             end=square.get_left(),
#             buff=0.1, # Small buffer to prevent arrow from touching the shapes
#             color=YELLOW, # A contrasting color for the arrow
#             stroke_width=6, # Make the arrow line a bit thicker
#             tip_length=0.3 # Adjust the size of the arrowhead
#         )

#         # 4. Animate the drawing of the arrow
#         # `Create` is perfect for drawing lines/arrows.
#         self.play(Create(arrow, run_time=2)) # Draw the arrow slowly
#         self.wait(1.5) # Keep the final state on screen for a moment

#         # 5. Optionally, highlight the interaction (e.g., flash the shapes)
#         self.play(
#             Flash(circle, color=RED_A),
#             Flash(square, color=BLUE_A),
#             run_time=1
#         )
#         self.wait(1) # Final pause