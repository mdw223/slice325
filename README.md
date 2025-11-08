🛠 Maintenance and Contributing Guide

Welcome! This guide will help you maintain and contribute to the Slice325 course content. Don’t worry if you’re new — we’ll walk through everything step by step.

📚 Technologies Used

Hugo – A static site generator that builds the course website.

GitHub Actions – Handles continuous integration and deployment automatically.

Markdown – The main format for writing course content.

Quizdown – Creates interactive quizzes inside the course.

🚀 Triggering GitHub Actions

Whenever you make a change, the site rebuilds itself automatically. Here’s how:

Make a commit to the main branch of the repository.

This can be as small as editing a single file (even this README).

You can do this locally in your editor or directly on GitHub.

Once the commit is pushed, GitHub Actions will start the build and deployment process for you.

👉 Tip: Even a tiny change (like fixing a typo) will trigger a rebuild.

📂 Adding a New Course Section

Create a new folder under content/new-course/.

Inside it, add sections as needed.

Each section should include an _index.md file with the correct front matter.

Use existing sections as a reference for structure and formatting.

All files should use Markdown syntax.

Quick reference: Markdown Cheat Sheet

🖼 Adding Images

Place images in the correct folder:static/images/section-X/ (replace X with the section number).

Reference images in Markdown like this:

![Alt text](/slice325/images/section-X/image-YYY.jpg)

Replace YYY with the image number.

📝 Adding a New Quiz

Quizzes use Quizdown.js.

To add one:

Create (or copy and modify) a Markdown file under content/course-path/(file).

Each file represents one quiz.

You can see sample quizzes or test your own live here:Quizdown Live Editor

🎓 Adding a Certificate

To generate a PDF certificate when a quiz is completed:

Open the quiz’s Markdown file.

Add this shortcode at the end:

{{< pdf-button course="Managing Hypertension and Diabetes" >}}

Update the course attribute with the exact course name you want to appear on the certificate.