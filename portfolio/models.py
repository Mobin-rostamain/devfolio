from django.db import models


class Project(models.Model):
    title = models.CharField(max_length=150, verbose_name="عنوان پروژه")
    main_image = models.ImageField(
        upload_to='projects/main/',
        verbose_name="تصویر اصلی"
    )
    description = models.TextField(verbose_name="توضیحات")
    technologies = models.CharField(
        max_length=255,
        verbose_name="تکنولوژی‌ها",
        help_text="با کاما جدا کن، مثال: Django, JavaScript, PostgreSQL"
    )
    link = models.URLField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name="لینک سایت"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")

    class Meta:
        verbose_name = "پروژه"
        verbose_name_plural = "پروژه‌ها"
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ProjectImage(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name="پروژه"
    )
    image = models.ImageField(
        upload_to='projects/gallery/',
        verbose_name="تصویر"
    )

    class Meta:
        verbose_name = "تصویر پروژه"
        verbose_name_plural = "تصاویر پروژه"

    def __str__(self):
        return f"تصویر مربوط به {self.project.title}"