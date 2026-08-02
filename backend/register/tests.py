from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import UserProfile


class RegisterViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_creates_user_and_profile_with_false_flags(self):
        response = self.client.post(
            '/api/register/',
            {
                'username': 'alice',
                'email': 'alice@example.com',
                'password': 'StrongPass123',
                'password2': 'StrongPass123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username='alice')
        self.assertTrue(UserProfile.objects.filter(user=user).exists())

        profile = user.userprofile
        self.assertFalse(profile.isAdmin)
        self.assertFalse(profile.isVendor)
