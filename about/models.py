from django.db import models


class Bio(models.Model):
    profile_photo = models.ImageField(
        upload_to='about/profile/',
        verbose_name="عکس پروفایل"
    )
    headline = models.CharField(
        max_length=200,
        verbose_name="عنوان کوتاه حرفه‌ای",
        help_text="مثال: توسعه‌دهنده بک‌اند و مدیر لینوکس"
    )
    bio_text = models.TextField(verbose_name="متن بیوگرافی")
    location = models.CharField(max_length=100, verbose_name="محل زندگی")
    email = models.EmailField(verbose_name="ایمیل عمومی")
    resume_file = models.FileField(
        upload_to='about/resume/',
        blank=True,
        null=True,
        verbose_name="فایل رزومه (PDF)"
    )

    class Meta:
        verbose_name = "بیوگرافی"
        verbose_name_plural = "بیوگرافی"

    def __str__(self):
        return "بیوگرافی"

    def save(self, *args, **kwargs):
        # الگوی Singleton: همیشه فقط یک ردیف از این مدل مجاز است
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # جلوگیری از حذف تصادفی تنها ردیف موجود
        pass


class TimelineEntry(models.Model):
    ENTRY_TYPE_CHOICES = [
        ('education', 'تحصیلی'),
        ('work', 'شغلی'),
    ]

    entry_type = models.CharField(
        max_length=20,
        choices=ENTRY_TYPE_CHOICES,
        verbose_name="نوع سابقه"
    )
    title = models.CharField(max_length=150, verbose_name="عنوان")
    organization = models.CharField(max_length=150, verbose_name="سازمان/دانشگاه")
    start_date = models.DateField(verbose_name="تاریخ شروع")
    end_date = models.DateField(
        blank=True,
        null=True,
        verbose_name="تاریخ پایان",
        help_text="اگر همچنان ادامه دارد، خالی بگذارید"
    )
    description = models.TextField(blank=True, verbose_name="توضیحات")

    class Meta:
        verbose_name = "سابقه"
        verbose_name_plural = "سوابق تحصیلی و شغلی"
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.title} - {self.organization}"

    @property
    def is_current(self):
        return self.end_date is None


class Skill(models.Model):
    CATEGORY_CHOICES = [
        ('backend', 'بک‌اند'),
        ('frontend', 'فرانت‌اند'),
        ('devops', 'دواپس'),
        ('tools', 'ابزارها'),
    ]

    name = models.CharField(max_length=80, verbose_name="نام مهارت")
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        verbose_name="دسته‌بندی"
    )
    proficiency = models.PositiveSmallIntegerField(
        verbose_name="سطح تسلط (۰ تا ۱۰۰)"
    )
    icon = models.ImageField(
        upload_to='about/skills/',
        verbose_name="آیکون/لوگو"
    )

    class Meta:
        verbose_name = "مهارت"
        verbose_name_plural = "مهارت‌ها"
        ordering = ['category', '-proficiency']

    def __str__(self):
        return self.name