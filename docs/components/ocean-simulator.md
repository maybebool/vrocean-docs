---
sidebar_position: 2
title: OceanSimulator
---

# OceanSimulator

The `OceanSimulator` component generates ocean wave displacement and normal textures using Fast Fourier Transform (FFT) algorithms. It runs entirely on the CPU using Burst-compiled jobs for high performance.

## Overview

OceanSimulator implements a six-stage simulation pipeline:

1. **Spectrum Initialization** - Generate initial wave amplitudes from Phillips spectrum
2. **Temporal Evolution** - Advance wave phases based on dispersion relationship
3. **Horizontal FFT** - Transform rows from frequency to spatial domain
4. **Vertical FFT** - Transform columns from frequency to spatial domain
5. **Displacement Finalization** - Apply choppiness and sign correction
6. **Surface Gradients** - Compute normals and foam from displacement field

The output is two textures updated each frame: a displacement map and a normal/foam map.

## Adding to Scene

1. Create a GameObject as a child of your ocean system root
2. Name it `OceanSimulator`
3. Add the `OceanSimulator` component
4. Assign a biome profile

```csharp
using UnityEngine;
using PlatypusIdeas.VROcean.Runtime.Scripts.Ocean;
using PlatypusIdeas.VROcean.Runtime.Scripts.Scene;

// Programmatic setup
GameObject simGo = new GameObject("OceanSimulator");
OceanSimulator simulator = simGo.AddComponent<OceanSimulator>();
simulator.Profile = myBiomeProfile;
```

## Inspector Fields


| Field | Type | Description |
|-------|------|-------------|
| Profile | AquaticBiomeProfile | Source of wave configuration |
| Editor Updates Enabled | bool | Allow simulation in edit mode (may cause instability) |
| Resolution | OceanResolution | FFT grid resolution |

### Resolution Options

| Value | Grid Size | Texture Size | Performance | Quality |
|-------|-----------|--------------|-------------|---------|
| _16x16 | 16x16 | 16x16 | Fastest | Low detail |
| _32x32 | 32x32 | 32x32 | Very fast | Basic |
| _64x64 | 64x64 | 64x64 | Fast | Good |
| _128x128 | 128x128 | 128x128 | Moderate | High |
| _256x256 | 256x256 | 256x256 | Slow | Very high |
| _512x512 | 512x512 | 512x512 | Very slow | Maximum |

For VR on Quest, use 64x64 or 128x128. Higher resolutions provide more wave detail but increase CPU cost significantly.

## Public Properties

### Profile

```csharp
public AquaticBiomeProfile Profile { get; set; }
```

The biome profile providing wave configuration. Changing this triggers spectrum regeneration.

```csharp
// Change profile at runtime
simulator.Profile = newProfile;
```

### Resolution

```csharp
public int Resolution { get; }
```

Returns the current grid resolution as an integer.

```csharp
int res = simulator.Resolution; // e.g., 128
int texelCount = res * res;     // e.g., 16384
```

### DisplacementTexture

```csharp
public Texture2D DisplacementTexture { get; }
```

The GPU texture containing XYZ displacement values. Format: `RGBAHalf`.

| Channel | Content |
|---------|---------|
| R | X displacement (horizontal, choppiness) |
| G | Y displacement (vertical, wave height) |
| B | Z displacement (horizontal, choppiness) |
| A | Unused |

```csharp
// Access for custom shader assignment
Material customMaterial = GetComponent<Renderer>().material;
customMaterial.SetTexture("_WaveDisplacement", simulator.DisplacementTexture);
```

### NormalTexture

```csharp
public Texture2D NormalTexture { get; }
```

The GPU texture containing surface normals and foam data. Format: `RGBA32` with mipmaps.

| Channel | Content |
|---------|---------|
| R | Normal X (packed, 0-1 range) |
| G | Normal Z (packed, 0-1 range) |
| B | Jacobian / Foam (0 = folded, 1 = flat) |
| A | Smoothness |

The texture includes generated mipmaps with filtered normals for distance-based roughness.

### DisplacementData

```csharp
public NativeArray<half4> DisplacementData { get; }
```

Direct CPU access to displacement values. This is the raw texture data before GPU upload.

```csharp
using Unity.Collections;
using Unity.Mathematics;

// Access displacement data for custom physics
NativeArray<half4> data = simulator.DisplacementData;

if (data.IsCreated)
{
    int index = y * simulator.Resolution + x;
    half4 displacement = data[index];
    
    float heightAtTexel = displacement.y;
}
```

This array is valid after `FinalizeFrame()` has been called. Use it for CPU-side water queries in custom systems.

## Public Methods

### Simulate

```csharp
public void Simulate(Vector3 windVector)
```

Advances the simulation by one frame. Called automatically by `SceneSystem`, but can be called manually for custom setups.

```csharp
// Manual simulation control
Vector3 wind = new Vector3(5f, 0f, 3f); // Wind direction and speed
simulator.Simulate(wind);
```

The method:
1. Checks if spectrum needs regeneration (profile or wind changed)
2. Schedules the job pipeline
3. Does not block - jobs run asynchronously

### FinalizeFrame

```csharp
public void FinalizeFrame()
```

Ensures all simulation jobs are complete and textures are uploaded to GPU. Call before rendering.

```csharp
// Ensure simulation is complete before rendering
simulator.FinalizeFrame();

// Now safe to use textures
Graphics.Blit(simulator.DisplacementTexture, destination);
```

`SceneSystem` calls this automatically in `BeginContextRendering`. Only call manually if not using SceneSystem.

## Job Pipeline

The simulation uses six Burst-compiled jobs scheduled in sequence:

```csharp
// Internal pipeline (simplified)
JobHandle handle = default;

// Stage 1: Time evolution
handle = new TemporalEvolutionJob(...).Schedule(texelCount, 64, handle);

// Stage 2: Horizontal FFT
handle = new HorizontalSpectralPassJob(...).Schedule(resolution, 1, handle);

// Stage 3: Vertical FFT
handle = new VerticalSpectralPassJob(...).Schedule(resolution, 1, handle);

// Stage 4: Finalize displacement
handle = new DisplacementFinalizationJob(...).Schedule(texelCount, 64, handle);

// Stage 5: Surface gradients
handle = new SurfaceGradientJob(...).Schedule(texelCount, 64, handle);

// Stage 6: Mipmap generation (multiple jobs)
for (int mip = 1; mip < mipCount; mip++)
{
    handle = new MipmapFilterJob(...).Schedule(mipTexelCount, 64, handle);
}

JobHandle.ScheduleBatchedJobs();
```

Jobs are scheduled non-blocking and completed in `FinalizeFrame()`.

## Memory Layout

### Native Arrays

| Array | Type | Size | Purpose |
|-------|------|------|---------|
| _initialAmplitudes | float4 | N*N | Initial spectrum |
| _angularFrequencyTable | float | N*N | Dispersion values |
| _heightBufferA/B | float2 | N*N | FFT ping-pong |
| _displacementBufferA/B | float4 | N*N | FFT ping-pong |
| _finalDisplacement | float3 | N*N | Output displacement |
| _normalMipChain | float4[] | Variable | Mipmap chain |

Where N = Resolution.

### Memory Usage by Resolution

| Resolution | Approximate Memory |
|------------|-------------------|
| 64x64 | ~1.5 MB |
| 128x128 | ~6 MB |
| 256x256 | ~24 MB |
| 512x512 | ~96 MB |

Memory is allocated persistently on enable and released on disable.

## Performance

### CPU Cost by Resolution

Measured on Quest 3 (single frame):

| Resolution | Job Time | Recommended Use |
|------------|----------|-----------------|
| 64x64 | ~0.3 ms | Quest standalone |
| 128x128 | ~0.8 ms | Quest with headroom |
| 256x256 | ~2.5 ms | PC VR |
| 512x512 | ~8 ms | High-end PC only |

### Optimization Tips

**Use appropriate resolution:**
```csharp
// Adjust resolution based on platform
#if UNITY_ANDROID
    resolution = OceanResolution._64x64;
#else
    resolution = OceanResolution._128x128;
#endif
```

**Avoid redundant spectrum regeneration:**
The spectrum regenerates when wind parameters change. Avoid rapid profile switching or wind changes.

**Profile version tracking:**
The simulator tracks profile versions to avoid unnecessary regeneration:
```csharp
// Profile.Version increments on inspector changes
// Simulator only regenerates when version changes
```

## Spectrum Regeneration

The wave spectrum is regenerated when:

- Profile reference changes
- Profile version changes (inspector modification)
- Wind vector changes (direction or speed)

Regeneration is synchronous and may cause a brief hitch. For smooth transitions:

```csharp
// Avoid rapid changes
// Bad: Changing wind every frame
void Update()
{
    wind = Mathf.Sin(Time.time) * 10f; // Regenerates every frame!
}

// Good: Change wind infrequently
void ChangeWind(float newSpeed)
{
    if (Mathf.Abs(newSpeed - currentSpeed) > 1f)
    {
        currentSpeed = newSpeed;
        // Spectrum regenerates once
    }
}
```

## Integration Without SceneSystem

OceanSimulator can be used independently:

```csharp
using UnityEngine;
using PlatypusIdeas.VROcean.Runtime.Scripts.Ocean;
using PlatypusIdeas.VROcean.Runtime.Scripts.Scene;

public class CustomOceanController : MonoBehaviour
{
    [SerializeField] private OceanSimulator simulator;
    [SerializeField] private AquaticBiomeProfile profile;

    private Vector3 windVector;

    void Start()
    {
        simulator.Profile = profile;
        UpdateWindVector();
    }

    void Update()
    {
        // Run simulation
        simulator.Simulate(windVector);
    }

    void LateUpdate()
    {
        // Finalize before rendering
        simulator.FinalizeFrame();

        // Apply textures to custom materials
        Shader.SetGlobalTexture("_OceanDisplacement", simulator.DisplacementTexture);
        Shader.SetGlobalTexture("_OceanNormal", simulator.NormalTexture);
    }

    void UpdateWindVector()
    {
        float yaw = profile.WindYaw * Mathf.Deg2Rad;
        float speed = profile.WaveConfig.WindSpeed;
        windVector = new Vector3(
            Mathf.Sin(yaw) * speed,
            0f,
            Mathf.Cos(yaw) * speed
        );
    }
}
```

## Accessing Raw Data

For custom physics or effects, access the displacement data directly:

```csharp
using Unity.Collections;
using Unity.Mathematics;

public class CustomWaterSampler : MonoBehaviour
{
    [SerializeField] private OceanSimulator simulator;

    public float SampleHeight(float2 uv)
    {
        if (!simulator.DisplacementData.IsCreated)
            return 0f;

        int res = simulator.Resolution;
        NativeArray<half4> data = simulator.DisplacementData;

        // Bilinear sample
        float u = math.frac(uv.x) * res;
        float v = math.frac(uv.y) * res;

        int x0 = (int)u;
        int y0 = (int)v;
        int x1 = (x0 + 1) % res;
        int y1 = (y0 + 1) % res;

        float fx = u - x0;
        float fy = v - y0;

        float4 c00 = (float4)data[y0 * res + x0];
        float4 c10 = (float4)data[y0 * res + x1];
        float4 c01 = (float4)data[y1 * res + x0];
        float4 c11 = (float4)data[y1 * res + x1];

        float4 result = math.lerp(
            math.lerp(c00, c10, fx),
            math.lerp(c01, c11, fx),
            fy
        );

        return result.y; // Height is in Y channel
    }
}
```

## Troubleshooting

### Textures Are Black

- Verify `Profile` is assigned
- Ensure you are in Play Mode
- Check that `Simulate()` and `FinalizeFrame()` are being called

### Simulation Stutters

- Spectrum is regenerating too often
- Check for rapid profile or wind changes
- Reduce resolution for your platform

### Memory Errors

- Resolution too high for available memory
- Reduce resolution or ensure proper cleanup in `OnDisable`

### Jobs Not Completing

- `FinalizeFrame()` not called before texture access
- Ensure proper frame timing between Simulate and Finalize

## Next Steps

- [Surface Renderer](./surface-renderer) - LOD mesh rendering
- [SceneSystem](./scene-system) - Orchestration component
- [VR Performance](../optimization/vr-performance) - Resolution guidelines