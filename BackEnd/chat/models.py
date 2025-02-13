from django.db import models
from django.conf import settings

class ChatMessage(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages")
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_messages")
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} -> {self.receiver}: {self.message[:30]}"

class ChatRoom(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_chatroom")
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, default=5, related_name="admin_chatrooms")  # Always Admin (user ID 5)
    room_name = models.CharField(max_length=255, unique=True)  # Unique room name

    def save(self, *args, **kwargs):
        """Automatically generate the room name: user_{userID}_admin"""
        if not self.room_name:
            self.room_name = f"user_{self.user.id}_admin"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.room_name