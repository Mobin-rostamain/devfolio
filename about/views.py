from django.shortcuts import render
from .models import Bio, TimelineEntry, Skill


def about_page(request):
    bio = Bio.objects.first()
    timeline = TimelineEntry.objects.all()
    skills = Skill.objects.all()

    skills_by_category = {}
    for code, label in Skill.CATEGORY_CHOICES:
        category_skills = skills.filter(category=code)
        if category_skills.exists():
            skills_by_category[label] = category_skills

    context = {
        'bio': bio,
        'timeline': timeline,
        'skills_by_category': skills_by_category,
    }
    return render(request, 'about/about.html', context)