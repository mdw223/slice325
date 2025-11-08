# MAINTENANCE AND CONTRIBUTING GUIDE

- This document provides guidelines for maintaining and contributing to the Slice325 course content.

## Techonologies Used

- **Hugo**: Static site generator used to build the course website.
- **GitHub Actions**: Used for continuous integration and deployment of the course website.
- **Markdown**: Primary format for writing course content.
- **Quizdown**: Used for creating interactive quizzes within the course.

### Triggering GitHub Actions

- To trigger a rebuild of the course website, make any commit to the `main` branch of the repository.
- This can be done by editing any file in the repository, even a minor change like updating this README.md file. Either through your editor locally or directly on GitHub.
- (Local)Once the commit is pushed to the `main` branch, GitHub Actions will automatically start the build and deployment process.

## Add a new course section

- Create a new folder under `content/new-course/` add sections as needed.
- Each section should have an `_index.md` file with the appropriate front matter.
- Use existing sections as a reference for structure and formatting.
- All files use markdown syntax. Markdown quick reference: https://www.markdownguide.org/cheat-sheet/

### How to add images

- Place images in the appropriate folder under `static/images/section-X/` where X is the section number.
- Reference images in markdown using the following syntax:
  `![Alt text](/slice325/images/section-X/image-YYY.jpg)` where YYY is the image number.

## Add a new Quiz

- Quiz module uses: https://github.com/bonartm/quizdown-js
- Create, or copy and modify, a markdown file under `content/course-path/(file)` for each quiz.
- See samples quizes or test quizes live in the browser using https://bonartm.github.io/quizdown-live-editor/

### Add a new certificate

- On any quiz markdown file, add the following shortcode at the end of the file to generate a PDF certificate upon completion:
- Use the `course` attribute to specify the course name as it should appear on the certificate.
{{< pdf-button course="Managing Hypertension and Diabetes" >}}





