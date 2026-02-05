# Troubleshooting: Ocean Appears Too Dark

## Problem Description

After importing VROcean into a new URP project, the ocean surface appears significantly darker than expected, and light reflections are missing from the water surface.

| Expected Result | Actual Problem |
|-----------------|----------------|
| ![Working Ocean](/img/1.png) | ![Dark Ocean](/img/2.png) |

If your scene looks like the image on the right instead of the left, follow the steps below to fix this issue.

---

## Solution

This issue is typically caused by URP rendering settings that need to be configured correctly. Follow these three steps:

### Step 1: Configure the Default Render Pipeline Asset

1. Go to **Edit → Project Settings → Graphics**
2. Locate the **Default Render Pipeline** field
3. Click on the assigned URP Asset to select it
4. In the Inspector window of this asset, disable both:
   - **Depth Texture**
   - **Opaque Texture**

![Graphics Settings](/img/GraphicsSettings.png)
![Inspector Graphics Settings](/img/Opaque.png)
---

### Step 2: Verify Quality Settings

1. Go to **Edit → Project Settings → Quality**
2. Locate the **Render Pipeline Asset** field
3. Ensure this is set to the **same URP Asset** you configured in Step 1

![Quality Settings](/img/QualitySettings.png)

---

### Step 3: Set Rendering Path to Forward

1. In the URP Asset from Steps 1 and 2, find the **Renderer List** section
2. Click on the **Universal Renderer Data** asset in the list
3. In the Inspector of this Renderer Data asset, locate the **Rendering** section
4. Set **Rendering Path** to **Forward**

![Renderer Settings](/img/Preset.png)

---

## Optimal Settings Overview

For reference, here are the recommended settings for all three configuration panels:

| Quality Settings | Renderer Data Settings |
|------------------|------------------------|
|[![Optimal Renderer](/img/QualityFull.png)](/img/QualityFull.png) | [![Optimal Graphics](/img/PipelineAsset.png)](/img/PipelineAsset.png)   |

After applying these settings, your ocean should display correctly with proper lighting and reflections.