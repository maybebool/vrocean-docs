---
sidebar_position: 2
title: Quick Setup
---

# Quick Setup

Get a working ocean scene in under 5 minutes. This guide covers the minimal setup required to see waves in your project.

## Prerequisites

- VROcean installed ([Installation Guide](./installation))
- A Unity project with URP configured
- An empty scene or existing scene to add the ocean to

## Step 1: Create the Scene System

The `SceneSystem` is the central manager that coordinates all ocean components.

1. Create an empty GameObject in your scene
2. Name it `OceanSystem`
3. Add the `SceneSystem` component


Alternatively, add it via code:

```csharp
using UnityEngine;
using PlatypusIdeas.VROcean.Runtime.Scripts.Scene;

public class OceanSetup : MonoBehaviour
{
    void Start()
    {
        var oceanSystem = new GameObject("OceanSystem");
        oceanSystem.AddComponent<SceneSystem>();
    }
}
```

## Step 2: Create the Ocean Simulator

The `OceanSimulator` generates wave displacement and normal textures using FFT.

1. Create a child GameObject under `OceanSystem`
2. Name it `OceanSimulator`
3. Add the `OceanSimulator` component
4. Add the `SurfaceLodRenderer` component

Your hierarchy should look like this:

```
OceanSystem
└── OceanSimulator
```

## Step 3: Create a Biome Profile

The `AquaticBiomeProfile` stores all configuration for waves, lighting, and materials.

1. In the Project window, right-click and select `Create > Oceanic > Environment Profile`
2. Name it `DefaultOcean`
3. Select the new profile to view it in the Inspector

![Biome Profile Inspector](/img/quick-setup-biome-profile.png)
*A new AquaticBiomeProfile with default settings*

### Assign the Ocean Material

1. Locate the included ocean material at `Assets/PlatypusIdeas/VROcean/Runtime/Materials/M_Ocean.mat`
2. Drag it into the `Surface Material` field of your biome profile

### Assign a Skybox Material

1. Locate an included skybox material (e.g., `M_DaySky.mat` or `M_NightSky.mat`)
2. Drag it into the `Skybox Material` field

## Step 4: Create a Post Processing Volume 
1. Create an empty child gameobject under SceneSystem.
2. Name it PostProcessVolume. Or whatever you like.
2. Add a `Volume` component. 

## Step 5: Create a Reflection Probe
1. Create an empty child gameobject under SceneSystem.
2. Name it BakedReflectionProbe. Or whatever you like.
2. Add a `Reflection Probe` component. 
 
## Step 6: Wire Up the Components

Now connect everything in the `SceneSystem` inspector:

| Field | Assignment |
|-------|------------|
| Ocean Compute | Drag the `OceanSimulator` GameObject |
| Ocean Quadtree Renderer | Drag the `SurfaceRenderer` GameObject |
| Target Profile | Drag your `DefaultOcean` profile asset |

![SceneSystem Wired](/img/quick-setup-wired.png)
*SceneSystem with all references assigned*

## Step 7: Configure the Surface Renderer

Select the `SurfaceRenderer` GameObject and configure:

| Field | Value |
|-------|-------|
| Surface Material | Drag the same `M_Ocean.mat` material |
| Ocean Size | 1024 (default, adjust as needed) |
| Quality | Medium (good starting point) |

## Step 9: Add Lighting

VROcean uses the scene's directional light for sun direction and color.

1. Add a Directional Light if one doesn't exist (`GameObject > Light > Directional Light`)
2. Position and rotate it to your desired sun angle
3. The biome profile's `Solar Config` section can override these settings

## Step 9: VR Camera
1. Locate the prefab `VR_Player_Camera` at `Assets/PlatypusIdeas/VROcean/Samples/Prefabs`
2. Delete the default camera in your scene
3. Drag and drop the `VR_Player_Camera` int othe scene

## Step 10: Enter Play Mode

Press Play. You should see animated ocean waves.

![Working Ocean](/img/quick-setup-result.jpg)
*A working ocean scene from a demo Scene*

If you see a flat plane or no water, check the [Troubleshooting](#troubleshooting) section below.

## Complete Hierarchy

Your final hierarchy should look like this:

```
Scene
├── OceanSystem
│   ├── OceanSimulator
│   └── PostProcessVolume
│   └── BakedReflectionProbe
├── Directional Light
└── VR_Player_Camera
```


## Using the Prefab (Recommended)

VROcean includes a pre-configured prefab for faster setup:

1. Navigate to `Assets/PlatypusIdeas/VROcean/Samples/Prefabs/`
2. Drag `OceanBiomeManager.prefab` into your scene
3. Assign your biome profile to the `SceneSystem` component
4. Enter Play Mode

The `OceanBiomeManager` prefab has all components pre-wired.
## Minimal Code Setup

If you prefer setting up via code, here is a complete example:

```csharp
using UnityEngine;
using PlatypusIdeas.VROcean.Runtime.Scripts.Scene;
using PlatypusIdeas.VROcean.Runtime.Scripts.Ocean;

public class OceanBootstrap : MonoBehaviour
{
    [SerializeField] private AquaticBiomeProfile profile;
    [SerializeField] private Material oceanMaterial;

    void Start()
    {
        // Create root
        var root = new GameObject("OceanSystem");
        
        // Add simulator
        var simGo = new GameObject("OceanSimulator");
        simGo.transform.SetParent(root.transform);
        var simulator = simGo.AddComponent<OceanSimulator>();
        simulator.Profile = profile;
        
        // Add renderer
        var renderGo = new GameObject("SurfaceRenderer");
        renderGo.transform.SetParent(root.transform);
        var renderer = renderGo.AddComponent<SurfaceLodRenderer>();
        renderer.SurfaceMaterial = oceanMaterial;
        
        // Add and configure scene system
        var sceneSystem = root.AddComponent<SceneSystem>();
        // Note: SceneSystem finds child components automatically if using the prefab workflow
    }
}
```

## Adjusting Wave Settings

With the ocean running, you can adjust wave behavior in real-time:

1. Select your biome profile asset
2. Expand the `Wave Config` section
3. Adjust `Wind Speed` to change wave height (0-64 m/s)
4. Adjust `Choppiness` to change wave sharpness (0-1)
5. Changes apply immediately in Play Mode

```csharp
// Or adjust via code at runtime
var profile = SceneSystem.Instance.GetComponent<SceneSystem>();
// Access the profile and modify WaveConfig values
```

## Troubleshooting

### No Water Visible

- Verify the `Surface Material` is assigned on both the profile and the `SurfaceLodRenderer`
- Check that the camera is positioned above the ocean (default Y position is 0)
- Ensure the `Ocean Size` is large enough to be visible from camera position

### Flat Surface (No Waves)

- Confirm you are in Play Mode (simulation only runs during play)
- Check that `Target Profile` is assigned on `SceneSystem`
- Verify `Wind Speed` in the profile is greater than 0

### Pink/Magenta Surface

- The material shader cannot compile. Ensure URP is active in Project Settings
- Reimport the shader files

### Low Framerate

- Reduce `Quality` preset on `SurfaceLodRenderer`
- Lower the `Resolution` on `OceanSimulator` (try 64x64 or 128x128)
- See [VR Performance Guide](../optimization/vr-performance) for detailed optimization

## Next Steps

- [First Floating Object](./first-floating-object) - Add buoyancy to GameObjects
- [Biome Profiles](../configuration/biome-profiles) - Deep dive into configuration
- [Wave Settings](../configuration/wave-settings) - Understand all wave parameters