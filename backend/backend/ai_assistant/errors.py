class AssistantError(ValueError):
    def __init__(self, code, message, status=503, *, provider_http_status=None):
        super().__init__(message)
        self.code, self.message, self.status = code, message, status
        self.provider_http_status = provider_http_status

    def as_dict(self):
        return {"code": self.code, "message": self.message}
