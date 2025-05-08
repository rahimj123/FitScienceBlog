# Instructions for Uploading to GitHub

Follow these steps to upload your FitScience Daily blog to your GitHub repository (rahimj123/FitScienceBlog):

## Option 1: Upload via GitHub Web Interface

1. Download your project files from Replit by clicking the three dots (⋮) next to your project name and selecting "Download as zip"

2. Extract the zip file on your local machine

3. Go to GitHub and navigate to your repository: https://github.com/rahimj123/FitScienceBlog

4. Click "Add file" > "Upload files"

5. Drag and drop or select the files you want to upload
   - You may need to do this in batches if there are many files

6. Add a commit message like "Initial commit - FitScience Daily blog platform"

7. Click "Commit changes"

## Option 2: Upload via Git Command Line

From your local machine after downloading and extracting the files:

```bash
# Initialize a new git repository
git init

# Add the remote repository
git remote add origin https://github.com/rahimj123/FitScienceBlog.git

# Add all files to git
git add .

# Commit the changes
git commit -m "Initial commit - FitScience Daily blog platform"

# Push to GitHub
git branch -M main
git push -u origin main
```

## Option 3: GitHub Desktop

1. Download GitHub Desktop: https://desktop.github.com/

2. Sign in with your GitHub account

3. Add the local repository (your downloaded project folder)

4. Commit to main branch with a message

5. Push to origin

## After Uploading to GitHub

Once your code is on GitHub, you can deploy to Vercel by:

1. Go to Vercel: https://vercel.com/new

2. Import your GitHub repository (rahimj123/FitScienceBlog)

3. Configure project settings:
   - Framework Preset: Other
   - Root Directory: ./

4. Add environment variables:
   - DATABASE_URL: Your PostgreSQL connection string
   
5. Click "Deploy"