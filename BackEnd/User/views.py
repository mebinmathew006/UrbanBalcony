from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
# Create your views here.


class UserHome(APIView):
    def get (self,request):
        datas = {
            'data1': [
                {
                    'image1': "https://via.placeholder.com/300",
                    'name': "Turmeric Powder",
                    'description': "High-quality turmeric powder with vibrant color and rich flavor."
                },
                {
                    'image1': "https://via.placeholder.com/300",
                    'name': "Cinnamon Sticks",
                    'description': "Naturally aromatic cinnamon sticks perfect for baking and cooking."
                },
                {
                    'image1': "https://via.placeholder.com/300",
                    'name': "Black Pepper",
                    'description': "Premium whole black pepper for bold and spicy flavors."
                },
                {
                    'image1': "https://via.placeholder.com/300",
                    'name': "Cardamom Pods",
                    'description': "Fresh and fragrant cardamom pods for desserts and teas."
                },
                {
                    'image1': "https://via.placeholder.com/300",
                    'name': "Cumin Seeds",
                    'description': "Authentic cumin seeds for enhancing the taste of curries."
                },
                {
                    'image1': "https://via.placeholder.com/300",
                    'name': "Clove Buds",
                    'description': "Whole clove buds with a strong and warm aroma for culinary uses."
                }
            ],
            'data2': [
                {
                    'image1': "https://via.placeholder.com/300",
                    'name': "Turmeric Powder",
                    'description': "High-quality turmeric powder with vibrant color and rich flavor."
                },
                {
                    'image1': "https://via.placeholder.com/300",
                    'name': "Cinnamon Sticks",
                    'description': "Naturally aromatic cinnamon sticks perfect for baking and cooking."
                },
                {
                    'image1': "https://via.placeholder.com/300",
                    'name': "Black Pepper",
                    'description': "Premium whole black pepper for bold and spicy flavors."
                },
                {
                    'image1': "https://via.placeholder.com/300",
                    'name': "Cardamom Pods",
                    'description': "Fresh and fragrant cardamom pods for desserts and teas."
                },
                {
                    'image1': "https://via.placeholder.com/300",
                    'name': "Cumin Seeds",
                    'description': "Authentic cumin seeds for enhancing the taste of curries."
                },
                {
                    'image1': "https://via.placeholder.com/300",
                    'name': "Clove Buds",
                    'description': "Whole clove buds with a strong and warm aroma for culinary uses."
                }
            ]
        }
        
        return Response(datas,200)


class UserLogin(APIView):
    def post(self,request):
        username=request.data.get('email')
        password=request.data.get('password')
        print(username,password)
        data=[{'status':'success'}]
        return Response(data)
    
class UserSignup(APIView):
    def post(self,request):
        firstname=request.data.get('firstname')
        lastname=request.data.get('lastname')
        phonenumber=request.data.get('phonenumber')
        email=request.data.get('email')
        password=request.data.get('password')
        print(firstname,lastname,phonenumber,email,password)
        data=[{'status':'success'}]
        return Response(data)
    
class ForgetPassword(APIView):
    def post(self,request):
        email=request.data.get('email')
        
        data=[{'status':'success'}]
        return Response(data)
    
class ResetPassword(APIView):
    def post(self,request):
        otp=request.data.get('otp')
        password=request.data.get('password')
        print(otp,password)
        data=[{'status':'success'}]
        return Response(data)