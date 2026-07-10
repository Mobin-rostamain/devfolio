from django.contrib import admin
from django.utils.html import format_html
from .models import Project, ProjectImage, Technology


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1
    fields = ['image', 'image_preview']
    readonly_fields = ['image_preview']

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 80px;" />', obj.image.url)
        return "—"
    image_preview.short_description = "پیش‌نمایش"


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'main_image_preview', 'created_at']
    search_fields = ['title']
    filter_horizontal = ['technologies']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ProjectImageInline]

    def main_image_preview(self, obj):
        if obj.main_image:
            return format_html('<img src="{}" style="max-height: 60px;" />', obj.main_image.url)
        return "—"
    main_image_preview.short_description = "تصویر"


@admin.register(Technology)
class TechnologyAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']