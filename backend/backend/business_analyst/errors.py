class OperationError(ValueError):
    """Safe, public error; exception details from handlers are never forwarded."""

    MESSAGES = {
        "PERMISSION_DENIED": "This operation is not permitted in the current context.",
        "INVALID_DOCUMENT_ID": "The document ID is not in the available catalog.",
        "DOCUMENT_UNAVAILABLE": "The requested document is unavailable.",
        "OUTPUT_TOO_LARGE": "The complete result exceeds the supported size. Request fewer operations.",
        "TOOL_NOT_REGISTERED": "This business tool is not registered.",
        "INVALID_PARAMETERS": "The parameters do not match the operation contract.",
        "RECORD_NOT_AVAILABLE": "The requested record is not available in the authorized scope.",
        "AMBIGUOUS_RECORD": "Several authorized records match. Use the listing tool and select a record ID.",
        "INVALID_OUTPUT": "The tool returned an invalid result.",
        "EXECUTION_FAILED": "The operation could not be completed.",
        "TIMEOUT": "The operation exceeded its execution deadline.",
        "LIMIT_EXCEEDED": "The execution limit has been reached.",
        "READ_ONLY_VIOLATION": "Business tools may only read data.",
    }

    def __init__(self, code):
        self.code = code
        super().__init__(self.MESSAGES[code])

    def as_dict(self):
        return {"code": self.code, "message": str(self)}
