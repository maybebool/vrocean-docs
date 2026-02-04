---
sidebar_position: 2
title: Quality Presets
---

# Quality Presets

The `SurfaceLodRenderer` component provides four quality presets that control mesh density and LOD behavior. This page explains each preset in detail and provides guidance for custom configurations.

## Preset Overview

| Preset | Vertices/Patch | LOD Threshold | Cull Scale | Target Platform |
|--------|---------------|---------------|------------|-----------------|
| Low | 16x16 (289) | 2.0 | 1.2 | Quest standalone |
| Medium | 32x32 (1,089) | 1.5 | 1.5 | Quest / Low-end PC |
| High | 64x64 (4,225) | 1.2 | 1.8 | PC VR |
| Ultra | 64x64 (4,225) | 1.0 | 2.0 | High-end PC |

## Preset Parameters Explained

### Vertices Per Patch

The grid resolution of each rendered ocean patch.

| Value | Grid | Triangles/Patch | Visual Quality |
|-------|------|-----------------|----------------|
| 16 | 17x17 | ~512 | Visible faceting at close range |
| 32 | 33x33 | ~2,048 | Smooth at typical distances |
| 64 | 65x65 | ~8,192 | Very smooth, high detail |

Higher vertex counts create smoother wave surfaces but increase GPU vertex processing cost.

### LOD Threshold

Controls when patches subdivide based on camera distance.

```
Subdivision occurs when: cameraDistance < (patchSize * LODThreshold)
```

| Value | Effect |
|-------|--------|
| 2.0 | Subdivide only when very close (fewer patches, lower quality) |
| 1.5 | Balanced subdivision distance |
| 1.2 | Subdivide at moderate distance (more patches, higher quality) |
| 1.0 | Subdivide aggressively (maximum patches, highest quality) |

Lower threshold values increase detail at distance but render more patches.

### Cull Scale

Multiplier for frustum culling bounding boxes.

| Value | Effect |
|-------|--------|
| 1.0 | Tight culling (may cause popping at screen edges) |
| 1.2 | Slight padding |
| 1.5 | Moderate padding |
| 2.0 | Conservative culling (renders some off-screen patches) |

Higher values prevent patches from popping in at screen edges but waste GPU cycles on non-visible geometry.

## Low Preset

```csharp
Vertices: 16
LODThreshold: 2.0
CullScale: 1.2
```

**Characteristics:**
- Minimum mesh density
- Aggressive LOD reduction
- Tight frustum culling

**Performance:**
- ~5,000-10,000 vertices typical
- ~20-40 draw calls
- Minimal GPU impact

**Visual Quality:**
- Visible polygon edges at close range
- Lower wave detail
- Acceptable for mobile VR where frame rate is critical

**Best For:**
- Quest 2 standalone
- Quest 3 at 120 Hz
- Scenes with many other rendering demands

```csharp
renderer.Quality = SurfaceLodRenderer.QualityLevel.Low;
```

## Medium Preset

```csharp
Vertices: 32
LODThreshold: 1.5
CullScale: 1.5
```

**Characteristics:**
- Balanced mesh density
- Moderate LOD transitions
- Reasonable culling padding

**Performance:**
- ~20,000-40,000 vertices typical
- ~25-50 draw calls
- Low-moderate GPU impact

**Visual Quality:**
- Smooth surface at typical viewing distances
- Good wave detail
- Minor faceting only at very close range

**Best For:**
- Quest 3 at 72-90 Hz
- PC VR with limited GPU headroom
- Default choice for most VR projects

```csharp
renderer.Quality = SurfaceLodRenderer.QualityLevel.Medium;
```

## High Preset

```csharp
Vertices: 64
LODThreshold: 1.2
CullScale: 1.8
```

**Characteristics:**
- High mesh density
- More subdivision at distance
- Conservative culling

**Performance:**
- ~80,000-150,000 vertices typical
- ~30-60 draw calls
- Moderate GPU impact

**Visual Quality:**
- Very smooth surface
- High wave detail at all distances
- No visible faceting

**Best For:**
- PC VR with mid-range GPU
- Dedicated ocean experiences
- When ocean is a visual focus

```csharp
renderer.Quality = SurfaceLodRenderer.QualityLevel.High;
```

## Ultra Preset

```csharp
Vertices: 64
LODThreshold: 1.0
CullScale: 2.0
```

**Characteristics:**
- Maximum mesh density
- Aggressive subdivision (always subdivide when possible)
- Very conservative culling

**Performance:**
- ~150,000-250,000 vertices typical
- ~40-80 draw calls
- Significant GPU impact

**Visual Quality:**
- Maximum surface smoothness
- Highest wave detail
- Best possible visual quality

**Best For:**
- High-end PC VR (RTX 3080+)
- Cinematic experiences
- Screenshots and video capture

```csharp
renderer.Quality = SurfaceLodRenderer.QualityLevel.Ultra;
```

## Performance Comparison

Measured on Quest 3 at 1024m ocean size:

| Preset | Vertices | Draw Calls | GPU Time | Frame Rate Impact |
|--------|----------|------------|----------|-------------------|
| Low | 8,200 | 24 | 0.8 ms | Minimal |
| Medium | 32,400 | 38 | 1.4 ms | Low |
| High | 98,000 | 52 | 2.8 ms | Moderate |
| Ultra | 186,000 | 71 | 4.2 ms | Significant |

Measured on RTX 3070 at 2048m ocean size:

| Preset | Vertices | Draw Calls | GPU Time | Frame Rate Impact |
|--------|----------|------------|----------|-------------------|
| Low | 12,400 | 32 | 0.3 ms | Negligible |
| Medium | 48,600 | 54 | 0.6 ms | Minimal |
| High | 142,000 | 78 | 1.2 ms | Low |
| Ultra | 268,000 | 104 | 2.1 ms | Moderate |

## Custom Configurations

For fine-tuned control, access the underlying parameters directly:

```csharp
using PlatypusIdeas.VROcean.Runtime.Scripts.Ocean;
using System.Reflection;

public class CustomQualityConfig : MonoBehaviour
{
    [SerializeField] private SurfaceLodRenderer renderer;

    // Note: Quality presets are defined in a static dictionary
    // For custom values, modify the renderer's behavior via:

    public void ApplyCustomQuality()
    {
        // Set base quality then override via ocean size and LOD
        renderer.Quality = SurfaceLodRenderer.QualityLevel.Medium;
        renderer.OceanSize = 768f; // Custom size
        
        // Force version increment to rebuild meshes
        renderer.Version++;
    }
}
```

### Custom Vertex Count

The vertex count is tied to the quality preset. To use a different count, you would need to modify the source or create a custom renderer variant.

Recommended approach: Choose the preset with the closest vertex count, then adjust LOD threshold behavior via ocean size.

### Adjusting LOD Behavior

While LOD threshold is preset-bound, you can influence LOD behavior through:

**Ocean Size:**
Smaller ocean = fewer LOD levels = less subdivision regardless of threshold.

```csharp
// Fewer LOD levels, effectively reducing detail
renderer.OceanSize = 512f;
```

**LOD Level Override:**
Cap the maximum LOD depth:

```csharp
// Inspector field: LOD Level Override
// 0 = automatic, 1-12 = manual cap
renderer.lodLevelOverride = 4; // Max 4 subdivision levels
```

**Camera Distance:**
LOD is camera-relative. Moving the camera affects subdivision.

## Dynamic Quality Adjustment

Adjust quality based on runtime performance:

```csharp
using UnityEngine;
using PlatypusIdeas.VROcean.Runtime.Scripts.Ocean;

public class DynamicQuality : MonoBehaviour
{
    [SerializeField] private SurfaceLodRenderer renderer;

    private float[] frameTimeHistory = new float[30];
    private int historyIndex = 0;

    private const float TargetFrameTime = 0.0111f; // 90 fps
    private const float DowngradeThreshold = 0.013f; // Below 77 fps
    private const float UpgradeThreshold = 0.009f; // Above 111 fps

    void Update()
    {
        // Track frame times
        frameTimeHistory[historyIndex] = Time.unscaledDeltaTime;
        historyIndex = (historyIndex + 1) % frameTimeHistory.Length;

        // Check every 30 frames
        if (historyIndex == 0)
        {
            EvaluateQuality();
        }
    }

    void EvaluateQuality()
    {
        float avgFrameTime = 0f;
        foreach (float t in frameTimeHistory)
        {
            avgFrameTime += t;
        }
        avgFrameTime /= frameTimeHistory.Length;

        var currentQuality = renderer.Quality;

        if (avgFrameTime > DowngradeThreshold && currentQuality > SurfaceLodRenderer.QualityLevel.Low)
        {
            renderer.Quality = currentQuality - 1;
            Debug.Log($"Ocean quality reduced to {renderer.Quality}");
        }
        else if (avgFrameTime < UpgradeThreshold && currentQuality < SurfaceLodRenderer.QualityLevel.Ultra)
        {
            renderer.Quality = currentQuality + 1;
            Debug.Log($"Ocean quality increased to {renderer.Quality}");
        }
    }
}
```

## Quality and Simulation Resolution

Quality presets affect rendering only. Combine with appropriate simulation resolution:

| Use Case | Simulation | Rendering |
|----------|------------|-----------|
| Quest Standalone | 64x64 | Low |
| Quest Quality | 64x64 | Medium |
| PC VR Balanced | 128x128 | Medium |
| PC VR Quality | 128x128 | High |
| PC VR Maximum | 256x256 | Ultra |

Mismatched settings waste resources:

```csharp
// Bad: High-res simulation with low-res mesh can't display detail
simulator.Resolution = OceanResolution._256x256;
renderer.Quality = QualityLevel.Low;

// Bad: Low-res simulation with high-res mesh wastes vertices
simulator.Resolution = OceanResolution._64x64;
renderer.Quality = QualityLevel.Ultra;

// Good: Matched settings
simulator.Resolution = OceanResolution._128x128;
renderer.Quality = QualityLevel.Medium;
```

## Preset Selection Guide

```
Is this for Quest standalone?
├─ Yes → Use Low or Medium
│        ├─ 72 Hz target → Medium acceptable
│        └─ 90/120 Hz target → Use Low
└─ No (PC VR)
   ├─ GPU: Entry level (GTX 1060, RX 580)
   │  └─ Use Medium
   ├─ GPU: Mid-range (RTX 2070, RX 6700)
   │  └─ Use High
   └─ GPU: High-end (RTX 3080+, RX 6900+)
      └─ Use High or Ultra
```

## Troubleshooting

### Visible Polygon Edges

**Symptom:** Can see individual triangles on wave surface

**Solutions:**
- Increase quality preset
- Move camera farther from water
- Reduce wave choppiness (smooths the surface)

### Too Many Draw Calls

**Symptom:** Draw call count exceeds 100

**Solutions:**
- Reduce quality preset (larger patches = fewer draw calls)
- Reduce ocean size
- Increase LOD level override (cap subdivision)

### Popping at Screen Edges

**Symptom:** Patches appear/disappear at screen edges

**Solutions:**
- Increase quality preset (higher cull scale)
- For custom configs, increase culling bounds manually

### Performance Varies by View Direction

**Symptom:** Looking down at water is slower than looking at horizon

**Solutions:**
- This is expected (more subdivision when looking down)
- Reduce quality if the variance is problematic
- Use smaller ocean size to cap maximum patches

## Next Steps

- [VR Performance](./vr-performance) - Platform-specific optimization
- [Surface Renderer](../components/surface-renderer) - Component reference