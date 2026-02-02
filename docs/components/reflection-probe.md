---
sidebar_position: 4
title: Reflection Probe
---

# Reflection Probe

The `BakedReflectionProbe` component manages reflection probe orientation correction for accurate water reflections. It works alongside Unity's standard `ReflectionProbe` to ensure reflections remain correct as the probe or scene moves.

## The Problem

Unity's reflection probes capture the environment as a cubemap from a fixed position and orientation. When the probe is baked, its orientation is stored. If the probe or camera moves after baking, reflections can appear incorrectly oriented.

For ocean rendering, this manifests as:
- Sky reflections that don't match the actual sky
- Rotated or skewed environment reflections
- Inconsistent reflections when moving through the scene

## The Solution

`BakedReflectionProbe` stores the probe's orientation at bake time and calculates a reorientation matrix each frame. This matrix is passed to the ocean shader to correct reflection sampling.

```
Corrected Reflection = ReorientationMatrix * Raw Reflection Direction
```

## Adding to Scene

1. Create a GameObject for your reflection probe
2. Add Unity's standard `ReflectionProbe` component
3. Add the `BakedReflectionProbe` component to the same GameObject
4. Configure and bake the reflection probe
5. Reference the probe in `SceneSystem`

## Inspector Fields

The `BakedReflectionProbe` component has no exposed inspector fields. It operates automatically based on the GameObject's transform.

## How It Works

### Bake Time

When the probe is baked (or when the scene loads), the component stores the current world transform:

```csharp
public void StoreBakeOrientation()
{
    _storedBakeOrientation = transform.localToWorldMatrix;
}
```

This is called automatically in `Awake()`.

### Runtime

Each frame, the component calculates the difference between the stored orientation and current orientation:

```csharp
public Matrix4x4 CalculateReorientationMatrix()
{
    return transform.worldToLocalMatrix * _storedBakeOrientation;
}
```

This matrix transforms reflection vectors from the current orientation back to the baked orientation.

### Shader Application

`SceneSystem` retrieves this matrix and sets it as a global shader property:

```csharp
// In SceneSystem.Environment.cs
Matrix4x4 reorientation = BakedReflectionProbe.ActiveProbe != null
    ? BakedReflectionProbe.ActiveProbe.CalculateReorientationMatrix()
    : Matrix4x4.identity;

commandBuffer.SetGlobalMatrix(ShaderPropertyIDs.Probe.Reorientation, reorientation);
```

The ocean shader uses this to correct reflection sampling:

```hlsl
// In ocean shader
float3 reflectionVector = reflect(-viewDirWS, normalWS);
reflectionVector = mul((float3x3)_ProbeReorientation, reflectionVector);
half3 reflection = GlossyEnvironmentReflection(reflectionVector, ...);
```

## Singleton Pattern

Only one `BakedReflectionProbe` should be active at a time. The component enforces this:

```csharp
public static BakedReflectionProbe ActiveProbe { get; private set; }

private void OnEnable()
{
    Debug.Assert(ActiveProbe == null, 
        "Two BakedReflectionProbe instances are active", this);
    ActiveProbe = this;
}

private void OnDisable()
{
    if (ActiveProbe == this)
        ActiveProbe = null;
}
```

Access the active probe from anywhere:

```csharp
if (BakedReflectionProbe.ActiveProbe != null)
{
    Matrix4x4 correction = BakedReflectionProbe.ActiveProbe.CalculateReorientationMatrix();
}
```

## Integration with SceneSystem

`SceneSystem` manages reflection probe updates through several methods:

### Automatic Updates

The probe re-renders periodically based on `Reflection Update Interval`:

```csharp
// SceneSystem inspector field
[SerializeField] private float reflectionUpdateInterval = 5f;
```

### Moving the Probe

Move the probe horizontally to follow the player:

```csharp
// Follow player position (maintains original Y height)
SceneSystem.Instance.MoveProbePosition(playerTransform);
```

### Resetting Position

Return the probe to its original position:

```csharp
SceneSystem.Instance.ResetProbePosition();
```

### Forcing Updates

Trigger an immediate probe render:

```csharp
// After significant scene changes
SceneSystem.Instance.ForceReflectionUpdateNextFrame();
```

### Changing Update Frequency

Adjust the update interval at runtime:

```csharp
// More frequent updates for dynamic scenes
SceneSystem.Instance.SetReflectionUpdateInterval(2f);

// Less frequent for static scenes
SceneSystem.Instance.SetReflectionUpdateInterval(10f);
```

## Probe Configuration

Configure the Unity `ReflectionProbe` component for ocean use:

### Recommended Settings

| Setting | Value | Reason |
|---------|-------|--------|
| Type | Realtime | Allows runtime updates |
| Refresh Mode | Via Scripting | SceneSystem controls updates |
| Time Slicing | Individual Faces | Spreads cost over frames |
| Resolution | 128 or 256 | Balance quality/performance |
| HDR | On | Better sky and sun capture |
| Box Projection | Off | Ocean is effectively infinite |
| Blend Distance | 0 | Single probe, no blending |

### Importance Setting

| Setting | Value | Reason |
|---------|-------|--------|
| Importance | 1 | Default priority |

### Culling Mask

Include layers that should appear in reflections:
- Sky
- Terrain
- Large static objects

Exclude:
- UI
- Small dynamic objects
- Particles


## Performance Considerations

### Update Frequency

Reflection probe rendering is expensive. Balance quality and performance:

| Interval | Updates/Minute | Use Case |
|----------|----------------|----------|
| 1 second | 60 | Dynamic scenes, high-end PC |
| 5 seconds | 12 | Default, balanced |
| 10 seconds | 6 | Static scenes, mobile VR |
| 30 seconds | 2 | Nearly static, Quest standalone |

### Time Slicing

The probe uses time slicing to spread render cost:

| Mode | Behavior |
|------|----------|
| All Faces At Once | Renders all 6 faces immediately (hitchy) |
| Individual Faces | Renders 1 face per frame (smooth) |
| No Time Slicing | Same as All Faces At Once |

`SceneSystem` uses `Individual Faces` by default and switches to `No Time Slicing` when forced updates are requested.

### Resolution

Lower resolutions significantly improve performance:

| Resolution | Texels | Relative Cost |
|------------|--------|---------------|
| 64 | 24,576 | 1x |
| 128 | 98,304 | 4x |
| 256 | 393,216 | 16x |
| 512 | 1,572,864 | 64x |

For VR, 128 is usually sufficient. The ocean shader's smoothness-based blur hides low resolution.

## VR Considerations

### Quest Standalone

For Quest standalone builds:

```csharp
// Reduce update frequency
SceneSystem.Instance.SetReflectionUpdateInterval(15f);

// Use low resolution (set in inspector)
// ReflectionProbe.resolution = 64 or 128

// Disable during intensive moments
SceneSystem.Instance.EnableProbeUpdates = false;
```

### PC VR

For PC VR with more headroom:

```csharp
// More frequent updates
SceneSystem.Instance.SetReflectionUpdateInterval(3f);

// Higher resolution acceptable
// ReflectionProbe.resolution = 256
```

## Multiple Probes

While `BakedReflectionProbe` enforces a single active instance, you can switch between probes:

```csharp
public class ProbeManager : MonoBehaviour
{
    [SerializeField] private BakedReflectionProbe[] probes;

    public void ActivateProbe(int index)
    {
        // Disable all
        foreach (var probe in probes)
        {
            probe.gameObject.SetActive(false);
        }

        // Enable selected
        probes[index].gameObject.SetActive(true);
    }
}
```

Use cases:
- Different probes for different scene areas
- Indoor vs outdoor probes
- Quality level switching

## Without BakedReflectionProbe

If you don't need orientation correction (probe never moves after baking):

1. Skip adding `BakedReflectionProbe`
2. `SceneSystem` will use `Matrix4x4.identity` for reorientation
3. Reflections work normally if probe orientation matches scene

However, for moving cameras or dynamic scenes, the component is recommended.

## Troubleshooting

### Reflections Look Wrong

- Verify `BakedReflectionProbe` is on the same GameObject as `ReflectionProbe`
- Check that only one `BakedReflectionProbe` is active
- Ensure the probe was baked after adding the component

### Reflections Don't Update

- Check `Enable Reflection Updates` in SceneSystem
- Verify `EnableProbeUpdates` property is true
- Confirm the scene is in Play Mode
- Check the update interval isn't too long

### Reflections Are Black

- Ensure the `ReflectionProbe` has been baked at least once
- Check culling mask includes skybox
- Verify HDR is enabled if using HDR rendering

### Performance Spikes

- Increase update interval
- Reduce probe resolution
- Ensure time slicing is set to Individual Faces
- Disable updates during intensive gameplay

### Probe Following Issues

- `MoveProbePosition` only changes X and Z, not Y
- Original Y position is restored by `ResetProbePosition`
- Check that the target transform is valid

## Next Steps

- [SceneSystem](./scene-system) - Probe management methods
- [Visual Tuning](../configuration/visual-tuning) - Reflection shader settings
- [VR Performance](../optimization/vr-performance) - Optimization strategies