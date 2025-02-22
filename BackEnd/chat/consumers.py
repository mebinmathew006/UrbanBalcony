import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatMessage
from User.models import CustomUser
from asgiref.sync import sync_to_async



class ChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f'chat_{self.room_name}'

        # Accept connection
        await self.accept()

        # Extract sender and receiver IDs from room_name
        try:
            _, sender_id, receiver_role = self.room_name.split("_")
            sender_id = int(sender_id)

            if receiver_role == "admin":
                receiver_id = 1  # Admin's ID
            else:
                receiver_id = sender_id  # Assume user is chatting with admin

            # Fetch previous messages
            messages = await sync_to_async(list)(
            ChatMessage.objects.filter(
            sender_id__in=[sender_id, receiver_id],
            receiver_id__in=[sender_id, receiver_id]
                )
                .order_by("-timestamp")  # ✅ Get latest messages first
                .values(
                    "sender__id", 
                    "receiver__id", 
                    "sender__first_name", 
                    "receiver__first_name", 
                    "message"
                )[:10]  # ✅ Fetch last 10 messages
            )
            messages.reverse()
            # Send chat history
            await self.send(text_data=json.dumps({
                "type": "chat_history",
                "messages": messages
            }))

        except Exception as e:
            print(f"Error fetching chat history: {e}")

        # Add user to WebSocket group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)


    async def receive(self, text_data):
        data = json.loads(text_data)
        sender_id = data['sender']
        receiver_id = data['receiver']
        sender_name = data['sender_name']
        receiver_name = data['receiver_name']
        message = data['message']

        print(f"Sender ID: {sender_id}, Receiver ID: {receiver_id}")  # Debugging line

        try:
            sender = await sync_to_async(CustomUser.objects.get)(id=sender_id)
        except CustomUser.DoesNotExist:
            print(f"Sender with ID {sender_id} does not exist.")
            return

        try:
            receiver = await sync_to_async(CustomUser.objects.get)(id=receiver_id)
        except CustomUser.DoesNotExist:
            print(f"Receiver with ID {receiver_id} does not exist.")  # Debugging output
            return



    async def chat_message(self, event):
        """Send a new chat message to the frontend"""
        await self.send(text_data=json.dumps(event))