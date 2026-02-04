---
sidebar_position: 1
title: VR Performance
---

# VR Performance

This guide covers optimization strategies for running VROcean on VR headsets, with specific focus on Meta Quest 3 standalone and PC VR platforms.

## Performance Targets

| Platform | Target Frame Rate | Frame Budget |
|----------|------------------|--------------|
| Quest 3 (72 Hz) | 72 fps | 13.9 ms |
| Quest 3 (90 Hz) | 90 fps | 11.1 ms |
| Quest 3 (120 Hz) | 120 fps | 8.3 ms |
| PC VR (90 Hz) | 90 fps | 11.1 ms |

VROcean should consume no more than 30-40% of your frame budget to leave room for game logic, physics, and other rendering.

| Platform | VROcean Budget |
|----------|---------------|
| Quest 3 (72 Hz) | 4-5 ms |
| Quest 3 (90 Hz) | 3-4 ms |
| PC VR | 3-4 ms |

## Quick Settings Reference

### Quest 3 Standalone (Recommended)

```
OceanSimulator:
  Resolution: 64x64

SurfaceLodRenderer:
  Quality: Low
  Ocean Size: 512 - 1024

Ocean Material:
  VR Mobile Mode: On
  Use Screen Effects: Off
  LOD Distance: 30
  Detail Fade Distance: 15

WaveConfig:
  Small Wave Suppression: 0.3 - 0.4

SceneSystem:
  Reflection Update Interval: 15 - 30 seconds

ReflectionProbe:
  Resolution: 64 - 128
```

### PC VR (Recommended)

```
OceanSimulator:
  Resolution: 128x128

SurfaceLodRenderer:
  Quality: Medium or High
  Ocean Size: 1024 - 2048

Ocean Material:
  VR Mobile Mode: Off
  Use Screen Effects: Optional
  LOD Distance: 50
  Detail Fade Distance: 30

WaveConfig:
  Small Wave Suppression: 0.1 - 0.2

SceneSystem:
  Reflection Update Interval: 3 - 5 seconds

ReflectionProbe:
  Resolution: 128 - 256
```

## Simulation Optimization

### Resolution Selection

The FFT resolution has the largest impact on CPU performance.

| Resolution | CPU Time (Quest 3) | Visual Quality | Recommendation |
|------------|-------------------|----------------|----------------|
| 64x64 | ~0.3 ms | Good | Quest standalone |
| 128x128 | ~0.8 ms | High | Quest with headroom, PC VR |
| 256x256 | ~2.5 ms | Very high | PC VR only |
| 512x512 | ~8 ms | Maximum | Not recommended for VR |

```csharp
// Platform-specific resolution
#if UNITY_ANDROID
    simulator.Resolution = OceanResolution._64x64;
#else
    simulator.Resolution = OceanResolution._128x128;
#endif
```

### Wave Pattern Size

Larger pattern sizes can hide low resolution:

```csharp
// Use larger pattern to mask low resolution detail
waveConfig.WavePatternSize = 96f; // Instead of 64
```

This increases the world-space size of waves, making individual texels less noticeable.

## Rendering Optimization

### Quality Presets

| Preset | Vertices/Frame | GPU Impact | Use Case |
|--------|---------------|------------|----------|
| Low | ~8,000 | Minimal | Quest standalone |
| Medium | ~30,000 | Low | Quest with headroom |
| High | ~120,000 | Moderate | PC VR mid-range |
| Ultra | ~200,000 | High | PC VR high-end |

```csharp
// Dynamic quality based on performance
void AdjustQuality()
{
    float fps = 1f / Time.smoothDeltaTime;
    
    if (fps < 68f) // Below Quest 72Hz target
    {
        renderer.Quality = QualityLevel.Low;
    }
    else if (fps > 85f)
    {
        renderer.Quality = QualityLevel.Medium;
    }
}
```

### Ocean Size

Smaller ocean areas require fewer LOD levels:

| Ocean Size | LOD Levels | Traversal Cost |
|------------|------------|----------------|
| 256 | 2 | Very low |
| 512 | 3 | Low |
| 1024 | 4 | Moderate |
| 2048 | 5 | Higher |
| 4096+ | 6+ | High |

For confined VR experiences (boat deck, small island), use smaller ocean sizes:

```csharp
// Small play area
renderer.OceanSize = 512f;

// Open ocean exploration
renderer.OceanSize = 1024f;
```

### LOD Distance

Reduce detail fade distance for faster LOD falloff:

```csharp
// Material property
material.SetFloat("_LODDistance", 30f);      // Default 50
material.SetFloat("_DetailFadeDistance", 15f); // Default 30
```

## Shader Optimization

### VR Mobile Mode

Enable `VR_MOBILE_MODE` in the ocean material for significant GPU savings:


**Features disabled by VR Mobile Mode:**
- Detail normal mapping
- Subsurface scattering
- Advanced reflections
- Foam texture sampling

**Features retained:**
- FFT displacement
- Basic normals and lighting
- Fresnel reflections
- Foam (simplified)
- Fog

```csharp
// Enable via code (if material has the property)
material.EnableKeyword("VR_MOBILE_MODE");
```

### Screen Effects

Disable `Use Screen Effects` unless essential:

```csharp
material.DisableKeyword("USE_SCREEN_EFFECTS");
```

Screen effects require:
- Depth texture sampling
- Opaque texture sampling
- Additional shader complexity

The visual benefit (depth-based color, refraction) is often not worth the cost in VR.

### Shader LOD

The ocean shader includes a fallback SubShader (LOD 50) for very low-end devices:

```hlsl
// Main SubShader - LOD 100
SubShader
{
    LOD 100
    // Full featured shader
}

// Fallback SubShader - LOD 50
SubShader
{
    LOD 50
    // Minimal shader: basic lighting + fresnel only
}
```

Force the fallback via Quality Settings or Shader LOD API if needed.

## Reflection Probe Optimization

### Update Frequency

Reflection probe updates are expensive. Reduce frequency for VR:

```csharp
// Quest standalone
SceneSystem.Instance.SetReflectionUpdateInterval(20f);

// PC VR
SceneSystem.Instance.SetReflectionUpdateInterval(5f);
```

### Probe Resolution

| Resolution | Cost | Quality |
|------------|------|---------|
| 64 | Low | Acceptable for mobile VR |
| 128 | Moderate | Good balance |
| 256 | High | PC VR only |

### Disable During Intensity

Pause probe updates during performance-critical moments:

```csharp
public class PerformanceManager : MonoBehaviour
{
    public void OnIntenseGameplayStart()
    {
        SceneSystem.Instance.EnableProbeUpdates = false;
    }

    public void OnIntenseGameplayEnd()
    {
        SceneSystem.Instance.EnableProbeUpdates = true;
        SceneSystem.Instance.ForceReflectionUpdateNextFrame();
    }
}
```

## Buoyancy Optimization

### Component Selection

| Component | CPU Cost | Use Case |
|-----------|----------|----------|
| NonPhysicBasedObjectFloatation | Lowest | Visual-only objects |
| PhysicBasedObjectFloatation | Low | Few physics objects |
| ThreadedPhysicBasedObjectFloatation | Lowest per-object | Many physics objects |

For Quest with multiple floating objects, always use the threaded variant:

```csharp
// Prefer threaded for VR
gameObject.AddComponent<ThreadedPhysicBasedObjectFloatation>();
```

### Sample Count

Reduce buoyancy sample resolution:

```csharp
// ThreadedPhysicBasedObjectFloatation
floatation.gridResolution = 0; // Minimum: (2*0+1)² = 1 sample
floatation.gridResolution = 1; // Default: (2*1+1)² = 9 samples
```

For small objects, a single center sample is often sufficient.

### Object Pooling

Avoid instantiating/destroying floating objects at runtime:

```csharp
public class FloatingObjectPool : MonoBehaviour
{
    private Queue<GameObject> pool = new Queue<GameObject>();

    public GameObject GetFloatingObject()
    {
        if (pool.Count > 0)
        {
            var obj = pool.Dequeue();
            obj.SetActive(true);
            return obj;
        }
        return CreateNewFloatingObject();
    }

    public void ReturnToPool(GameObject obj)
    {
        obj.SetActive(false);
        pool.Enqueue(obj);
    }
}
```

## VR Comfort Optimization

Performance and comfort are related. Dropped frames cause discomfort.

### Small Wave Suppression

Higher values reduce high-frequency detail that can cause eye strain:

```csharp
waveConfig.SmallWaveSuppression = 0.35f; // Comfortable for most users
```

### Time Scale

Slower waves are more comfortable:

```csharp
waveConfig.TimeScale = 0.8f; // 80% speed
```

### Choppiness

Reduce choppiness for calmer motion:

```csharp
waveConfig.Choppiness = 0.6f; // Less sharp peaks
```

## Profiling

### Unity Profiler Markers

VROcean includes profiler markers:

| Marker | Location | Measures |
|--------|----------|----------|
| LOD Traversal | SurfaceLodRenderer | Quadtree traversal |
| Patch Submission | SurfaceLodRenderer | Matrix building |
| (Job markers) | OceanSimulator | FFT job execution |

### Key Metrics to Watch

| Metric | Target (Quest 3) | Location |
|--------|------------------|----------|
| Ocean jobs | < 1 ms | Profiler > Jobs |
| LOD traversal | < 0.3 ms | Profiler > Scripts |
| Draw calls | < 30 | Frame Debugger |
| Triangle count | < 50k | Frame Debugger |

### Performance Testing Checklist

1. Test on target hardware, not editor
2. Build with IL2CPP (not Mono)
3. Enable Burst compilation
4. Test at target frame rate (72/90/120 Hz)
5. Test with representative scene content
6. Monitor thermal throttling on Quest

## Platform-Specific Tips

### Quest 3

```csharp
void ConfigureForQuest()
{
    // Simulation
    simulator.Resolution = OceanResolution._64x64;
    
    // Rendering
    renderer.Quality = QualityLevel.Low;
    renderer.OceanSize = 512f;
    
    // Material
    oceanMaterial.EnableKeyword("VR_MOBILE_MODE");
    oceanMaterial.DisableKeyword("USE_SCREEN_EFFECTS");
    
    // Reflections
    SceneSystem.Instance.SetReflectionUpdateInterval(20f);
    
    // Comfort
    profile.WaveConfig.SmallWaveSuppression = 0.35f;
    profile.WaveConfig.TimeScale = 0.9f;
}
```

### Quest 2

Quest 2 has less headroom than Quest 3:

```csharp
void ConfigureForQuest2()
{
    simulator.Resolution = OceanResolution._64x64;
    renderer.Quality = QualityLevel.Low;
    renderer.OceanSize = 256f; // Smaller than Quest 3
    
    // Consider disabling reflection updates entirely
    SceneSystem.Instance.EnableProbeUpdates = false;
}
```

### PC VR (Mid-Range)

```csharp
void ConfigureForPCVR()
{
    simulator.Resolution = OceanResolution._128x128;
    renderer.Quality = QualityLevel.Medium;
    renderer.OceanSize = 1024f;
    
    // Can afford more features
    oceanMaterial.DisableKeyword("VR_MOBILE_MODE");
    
    SceneSystem.Instance.SetReflectionUpdateInterval(5f);
}
```

### PC VR (High-End)

```csharp
void ConfigureForHighEndPCVR()
{
    simulator.Resolution = OceanResolution._256x256;
    renderer.Quality = QualityLevel.High;
    renderer.OceanSize = 2048f;
    
    // Full features
    oceanMaterial.DisableKeyword("VR_MOBILE_MODE");
    oceanMaterial.EnableKeyword("USE_SCREEN_EFFECTS");
    
    SceneSystem.Instance.SetReflectionUpdateInterval(2f);
}
```

## Common Performance Issues

### High CPU Usage

**Symptom:** CPU frame time exceeds budget

**Solutions:**
- Reduce simulation resolution
- Reduce buoyancy sample counts
- Use threaded buoyancy component
- Reduce ocean size (fewer LOD levels)

### High GPU Usage

**Symptom:** GPU frame time exceeds budget

**Solutions:**
- Enable VR Mobile Mode
- Disable screen effects
- Reduce quality preset
- Lower reflection probe resolution

### Frame Spikes

**Symptom:** Periodic hitches

**Solutions:**
- Avoid rapid profile/wind changes (spectrum regeneration)
- Increase reflection update interval
- Use time-sliced probe rendering
- Pool floating objects

### Thermal Throttling

**Symptom:** Performance degrades over time on Quest

**Solutions:**
- Reduce all quality settings
- Add rest periods for the GPU
- Lower target frame rate to 72 Hz

## Next Steps

- [Quality Presets](./quality-presets) - Detailed preset configuration
- [Wave Settings](../configuration/wave-settings) - Comfort-focused configuration