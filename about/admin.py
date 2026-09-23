from django.contrib import admin
from django.utils.html import format_html
from .models import Bio, TimelineEntry, Skill


@admin.register(Bio)
class BioAdmin(admin.ModelAdmin):
    list_display = ['headline', 'location', 'email', 'photo_preview']

    def photo_preview(self, obj):
        if obj.profile_photo:
            return format_html('<img src="{}" style="max-height: 60px; border-radius: 6px;" />', obj.profile_photo.url)
        return "—"
    photo_preview.short_description = "پیش‌نمایش"

    def has_add_permission(self, request):
        # چون Bio تک‌نمونه‌ایه، اگه از قبل یه ردیف وجود داره، اجازه‌ی ساخت ردیف جدید نده
        return not Bio.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # جلوگیری از حذف تنها ردیف موجود از طریق پنل ادمین
        return False


@admin.register(TimelineEntry)
class TimelineEntryAdmin(admin.ModelAdmin):
    list_display = ['title', 'organization', 'entry_type', 'start_date', 'end_date']
    list_filter = ['entry_type']
    search_fields = ['title', 'organization']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'proficiency', 'icon_preview']
    list_filter = ['category']
    search_fields = ['name']

    def icon_preview(self, obj):
        if obj.icon:
            return format_html('<img src="{}" style="max-height: 32px;" />', obj.icon.url)
        return "—"
    icon_preview.short_description = "آیکون"