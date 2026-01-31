---
sidebar_position: 1
title: Installation
---

# Installation

This guide covers importing VROcean into your Unity project and verifying the installation.

## Requirements

Before installing VROcean, ensure your project meets these requirements:

| Requirement | Minimum Version | Recommended |
|-------------|-----------------|-------------|
| Unity | 2022.3 LTS | 2022.3.20f1+ |
| Render Pipeline | URP 14.0 | URP 14.0.8+ |
| Burst | 1.8.0 | 1.8.8+ |
| Collections | 2.1.0 | 2.2.0+ |
| Mathematics | 1.2.0 | 1.3.1+ |

VROcean requires the Universal Render Pipeline (URP). It is not compatible with the Built-in Render Pipeline or HDRP.

## Step 1: Import the Package

### From Unity Asset Store

1. Open the Unity Asset Store in your browser or via `Window > Asset Store`
2. Purchase or download VROcean
3. In Unity, open `Window > Package Manager`
4. Select `My Assets` from the dropdown
5. Find VROcean and click `Import`
6. Import all files when prompted

### From .unitypackage File

1. In Unity, go to `Assets > Import Package > Custom Package`
2. Navigate to the downloaded `VROcean.unitypackage` file
3. Click `Open`
4. Import all files when prompted

## Step 2: Install Dependencies

VROcean depends on Unity's DOTS packages. If they are not already installed, add them via Package Manager:

1. Open `Window > Package Manager`
2. Click the `+` button and select `Add package by name`
3. Add each of the following packages:

```
com.unity.burst
com.unity.collections
com.unity.mathematics
```

Alternatively, add them directly to your `Packages/manifest.json`:

```json
{
  "dependencies": {
    "com.unity.burst": "1.8.8",
    "com.unity.collections": "2.2.0",
    "com.unity.mathematics": "1.3.1",
    "com.unity.render-pipelines.universal": "14.0.8"
  }
}
```

## Step 3: Welcome Window

After importing, the VROcean Welcome Window appears automatically.

![Welcome Window](/img/welcome-window.png)
*The Welcome Window provides quick access to documentation and sample scenes*

The Welcome Window offers:

- Links to documentation and support
- Quick setup options
- Sample scene access

If the window does not appear, open it manually via `Window > VROcean > Welcome`.

## Step 4: Verify Installation

Confirm that VROcean is installed correctly:

1. Check that the `PlatypusIdeas` folder exists in your Project window under `Assets`
2. Verify no console errors related to missing dependencies
3. Confirm the VROcean menu appears under `Window > VROcean`

### Namespace Check

You can verify the installation in code by checking if the namespace resolves:

```csharp
using PlatypusIdeas.VROcean.Runtime.Scripts.Scene;
using PlatypusIdeas.VROcean.Runtime.Scripts.Ocean;
using PlatypusIdeas.VROcean.Runtime.Scripts.Physics;
```

If these namespaces resolve without errors, the installation is complete.

## Folder Structure

After installation, VROcean creates the following structure:

```
Assets/
└── PlatypusIdeas/
    └── VROcean/
        ├── Runtime/
        │   ├── Scripts/
        │   │   ├── Core/           # Singleton base class
        │   │   ├── IDs/            # Shader property IDs
        │   │   ├── Jobs/           # Burst-compiled jobs
        │   │   ├── Math/           # Complex and surface math
        │   │   ├── Ocean/          # Simulator and renderer
        │   │   ├── Physics/        # Buoyancy components
        │   │   ├── Rendering/      # Reflection probe
        │   │   └── Scene/          # SceneSystem
        │   ├── Shaders/            # Ocean and skybox shaders
        │   ├── Materials/          # Default materials
        │   └── Profiles/           # Example biome profiles
        ├── Editor/
        │   └── Scripts/            # Welcome window, tools
        └── Samples/                # Example scenes
```


## Troubleshooting Installation

### Missing Burst Package

**Error:** `The type or namespace name 'Burst' could not be found`

**Solution:** Install the Burst package via Package Manager or manifest.json as described in Step 2.

### Shader Errors

**Error:** `Shader error in 'Custom/FFTOceanURP_VR': undeclared identifier`

**Solution:** Ensure URP is installed and configured. VROcean shaders require URP shader libraries.

### Pink Materials

**Symptom:** Ocean surface appears pink/magenta

**Solution:** 
1. Verify URP is the active render pipeline in `Edit > Project Settings > Graphics`
2. Reimport the VROcean shaders by right-clicking the Shaders folder and selecting `Reimport`

### Script Compilation Errors

**Error:** Errors referencing `NativeArray` or `float3`

**Solution:** Install the Collections and Mathematics packages as described in Step 2.

## Next Steps

With VROcean installed, proceed to [Quick Setup](./quick-setup) to create your first ocean scene.