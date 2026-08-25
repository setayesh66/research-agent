"""
A sandboxed Python code execution tool.

SAFETY NOTE: exec() can run arbitrary code. We restrict what's available
to the executed code (no file access, no imports, no network) to reduce
risk, but this is still not a fully secure sandbox — never expose this
tool on a publicly-accessible deployment without much stronger isolation
(e.g. running in a separate container with no filesystem/network access).
For a local learning project, this restricted version is a reasonable
starting point.
"""


import math
from langchain.tools import tool

_SAFE_BUILTINS = {
    "abs": abs, "round": round, "min": min, "max": max,
    "sum": sum, "len": len, "range": range, "sorted": sorted,
    "print": print,
}

_SAFE_GLOBALS = {"__builtins__": _SAFE_BUILTINS, "math": math}


@tool
def execute_code(code: str) -> str:
    """Execute Python code to perform calculations, such as pricing math, unit conversions, 
    or numeric comparisons. The code must assign its final answer to a variable named result. 
    Only basic math operations and the math module are available, no file or network access. 
    Use this whenever a question requires precise arithmetic rather than estimation."""

    local_vars={}

    try:
        exec(code, _SAFE_GLOBALS, local_vars)

    except Exception as e:
        return f"Error executing code: {e}"

    if "result" not in local_vars:
        return "Error: code did not set a variable named 'result'."

    return f"Result: {local_vars['result']}"

    


