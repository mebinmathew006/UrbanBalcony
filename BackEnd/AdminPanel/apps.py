from django.apps import AppConfig


class AdminpanelConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'AdminPanel'
    def ready(self):
        import AdminPanel.signals