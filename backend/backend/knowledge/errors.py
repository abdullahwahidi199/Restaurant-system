"""Stable, safe errors for a future tool orchestrator."""


class GatewayError(ValueError):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code
        self.message = message

    def as_result(self):
        return {"error": {"code": self.code, "message": self.message}}
