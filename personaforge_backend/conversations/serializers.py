from rest_framework import serializers
from .models import ConversationMessage

class ConversationMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConversationMessage
        fields = "__all__"
