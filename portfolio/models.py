from django.db import models
from django.utils.text import slugify


class Technology(models.Model):
    name = models.CharField(max_length=50, verbose_name="نام تکنولوژی")

    class Meta:
        verbose_name = "تکنولوژی"
        verbose_name_plural = "تکنولوژی‌ها"

    def __str__(self):
        return self.name


class Project(models.Model):
    title = models.CharField(max_length=150, verbose_name="عنوان پروژه")
    slug = models.SlugField(max_length=170, unique=True, blank=True, verbose_name="آدرس یکتا")
    main_image = models.ImageField(
        upload_to='projects/main/',
        verbose_name="تصویر اصلی"
    )
    description = models.TextField(verbose_name="توضیحات")
    technologies = models.ManyToManyField(
        Technology,
        related_name="projects",
        verbose_name="تکنولوژی‌ها"
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

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title, allow_unicode=True)
        super().save(*args, **kwargs)


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