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

        try:
            _, sender_id, receiver_role = self.room_name.split("_")
            sender_id = int(sender_id)

            if receiver_role == "admin":
                receiver_id = 1
            else:
                receiver_id = sender_id

            # Fetch previous messages
            messages = await sync_to_async(list)(
                ChatMessage.objects.filter(
                    sender_id__in=[sender_id, receiver_id],
                    receiver_id__in=[sender_id, receiver_id]
                )
                .order_by("-timestamp")
                .values(
                    "sender__id", 
                    "receiver__id", 
                    "sender__first_name", 
                    "receiver__first_name", 
                    "message",
                    "timestamp"  # Include timestamp in values
                )[:10]
            )
            messages.reverse()
            
            # Convert timestamps to ISO format
            for message in messages:
                if message.get('timestamp'):
                    message['timestamp'] = message['timestamp'].isoformat()

            await self.send(text_data=json.dumps({
                "type": "chat_history",
                "messages": messages
            }))

        except Exception as e:
            print(f"Error fetching chat history: {e}")
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "Failed to load chat history"
            }))

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            
            # Save message to database first
            chat_message = await self.save_message(data)
            
            if chat_message:
                # Only broadcast if save was successful
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': data['message'],
                        'sender__id': data['sender'],
                        'receiver__id': data['receiver'],
                        'sender__first_name': data['sender_name'],
                        'receiver__first_name': data['receiver_name'],
                        'timestamp': chat_message.timestamp.isoformat()
                    }
                )
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Failed to save message'
                }))

        except Exception as e:
            print(f"Error in receive: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to process message'
            }))

    @sync_to_async
    def save_message(self, data):
        try:
            sender = CustomUser.objects.get(id=data['sender'])
            receiver = CustomUser.objects.get(id=data['receiver'])
            return ChatMessage.objects.create(
                sender=sender,
                receiver=receiver,
                message=data['message']
            )
        except Exception as e:
            print(f"Database operation error: {e}")
            return None

    async def chat_message(self, event):
        """Send message to WebSocket without modifying the event"""
        await self.send(text_data=json.dumps(event))