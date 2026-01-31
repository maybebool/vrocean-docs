---
sidebar_position: 2
title: Wave Settings
---

# Wave Settings

The `WaveConfig` section of an `AquaticBiomeProfile` controls all parameters of the FFT wave simulation. This page provides detailed explanations of each parameter, their effects, and recommended values for different scenarios.

## Parameter Reference

### Wind Speed

```
Range: 0 - 64 m/s
Default: 8.0
```

The primary driver of wave height and energy. Higher wind speeds produce larger, faster waves.

| Value | Result |
|-------|--------|
| 0 - 2 | Near-flat water with minimal ripples |
| 3 - 8 | Calm to moderate seas |
| 9 - 20 | Rough seas with significant wave height |
| 21 - 40 | Storm conditions |
| 41 - 64 | Extreme conditions (hurricane-force) |

![Wind Speed Comparison](/img/wave-settings-windspeed.png)
*Left: Wind Speed 4 (calm). Center: Wind Speed 12 (moderate). Right: Wind Speed 28 (stormy).*

```csharp
// Access wind speed from active profile
float windSpeed = SceneSystem.Instance.WindVector.magnitude;
```

### Wind Alignment

```
Range: 0 - 1
Default: 0.5
```

Controls the directional spreading of waves relative to wind direction.

| Value | Result |
|-------|--------|
| 0.0 | Waves spread in all directions equally (omnidirectional) |
| 0.5 | Moderate directional focus |
| 1.0 | Waves align tightly with wind direction |

Low values create a chaotic, confused sea state. High values create organized wave trains moving in a clear direction.

![Wind Alignment Comparison](/img/wave-settings-alignment.png)
*Left: Alignment 0.1 (chaotic). Right: Alignment 0.9 (directional).*

### Choppiness

```
Range: 0 - 1
Default: 1.0
```

Controls the horizontal displacement that creates sharp wave peaks. This is a visual parameter that does not affect the underlying simulation.

| Value | Result |
|-------|--------|
| 0.0 | Smooth, rolling waves with rounded peaks |
| 0.5 | Moderate sharpness |
| 1.0 | Sharp, peaked waves with visible crests |

High choppiness can cause geometry folding at extreme wave heights, which creates foam. Values above 1.0 are not recommended.

```csharp
// Choppiness is applied in the shader
// Access via the profile
float choppiness = profile.WaveConfig.Choppiness;
```

### Small Wave Suppression

```
Range: 0 - 1
Default: 0.1
```

Filters out high-frequency wave detail. This parameter is important for VR comfort.

| Value | Result |
|-------|--------|
| 0.0 | All wave frequencies visible (maximum detail) |
| 0.3 | Small ripples reduced |
| 0.6 | Only medium and large waves remain |
| 1.0 | Only the largest wave components visible |

Higher values improve VR comfort by reducing visual noise that can cause eye strain. They also improve performance slightly by reducing high-frequency displacement detail.

**VR Recommendation:** Use 0.2 - 0.4 for comfortable viewing on Quest headsets.

### Wave Pattern Size

```
Range: 16 - 256 meters
Default: 64
```

The world-space size of the wave pattern before it tiles. This affects both visual tiling and wave scale.

| Value | Result |
|-------|--------|
| 16 - 32 | Small pattern, visible tiling, detailed waves |
| 64 - 128 | Balanced setting for most scenes |
| 192 - 256 | Large pattern, minimal tiling, broader waves |

Smaller values show more wave detail but tiling becomes visible at distance. Larger values hide tiling but waves appear broader and less detailed.

![Wave Pattern Size Comparison](/img/wave-settings-patternsize.png)
*Left: Pattern Size 32 (visible tiling at horizon). Right: Pattern Size 128 (minimal tiling).*

The pattern size also affects water queries:

```csharp
// Pattern size is needed for UV calculations
float patternSize = SceneSystem.Instance.GetWavePatternSize();

// Convert world position to ocean UV
Vector2 oceanUV = new Vector2(
    worldPos.x / patternSize,
    worldPos.z / patternSize
);
```

### Wave Inertia

```
Range: 0+
Default: 9.81
```

The gravity constant used in the dispersion relationship. This controls how wave speed relates to wavelength.

| Value | Result |
|-------|--------|
| 9.81 | Realistic Earth ocean behavior |
| < 9.81 | Slower wave propagation (moon-like) |
| > 9.81 | Faster wave propagation |

For realistic ocean simulation, keep this at 9.81. Adjusting this creates alien or stylized water behavior.

### Simulation Loop Duration

```
Range: 1+ seconds
Default: 200
```

The time in seconds before the wave animation loops back to its starting state.

| Value | Result |
|-------|--------|
| 30 - 60 | Short loop, may notice repetition |
| 120 - 200 | Standard duration, repetition rarely noticed |
| 300+ | Very long loop, no visible repetition |

Longer durations consume the same memory but reduce the chance of players noticing the animation repeat. For most applications, 200 seconds is sufficient.

### Time Scale

```
Range: 0 - 2
Default: 1.0
```

Multiplier for simulation time progression.

| Value | Result |
|-------|--------|
| 0.0 | Frozen waves (no animation) |
| 0.5 | Half-speed waves |
| 1.0 | Real-time wave speed |
| 2.0 | Double-speed waves |

Useful for dramatic effect or matching a specific visual style. Very high values may cause visible stepping in wave motion.

```csharp
// Time scale affects the simulation time passed to jobs
float simulationTime = Time.time * profile.WaveConfig.TimeScale;
```

## Preset Configurations

### Calm Lake

```
Wind Speed: 2
Wind Alignment: 0.3
Choppiness: 0.4
Small Wave Suppression: 0.3
Wave Pattern Size: 32
Time Scale: 0.8
```

Gentle, reflective water suitable for lakes or protected harbors.

### Open Ocean (Moderate)

```
Wind Speed: 10
Wind Alignment: 0.6
Choppiness: 0.9
Small Wave Suppression: 0.1
Wave Pattern Size: 64
Time Scale: 1.0
```

Typical ocean conditions with visible wave trains and moderate swell.

### Stormy Seas

```
Wind Speed: 25
Wind Alignment: 0.7
Choppiness: 1.0
Small Wave Suppression: 0.05
Wave Pattern Size: 128
Time Scale: 1.2
```

Rough conditions with large waves and significant foam generation.

### VR Comfort Priority

```
Wind Speed: 6
Wind Alignment: 0.5
Choppiness: 0.6
Small Wave Suppression: 0.4
Wave Pattern Size: 64
Time Scale: 0.9
```

Balanced visuals with reduced high-frequency detail for comfortable VR viewing.

## How Parameters Interact

### Wind Speed and Wave Pattern Size

These parameters are related. Larger pattern sizes support higher wind speeds without excessive tiling. As a guideline:

| Wind Speed | Minimum Pattern Size |
|------------|---------------------|
| 0 - 10 | 32+ |
| 11 - 25 | 64+ |
| 26 - 45 | 128+ |
| 46 - 64 | 192+ |

### Choppiness and Foam

The foam system uses the Jacobian of the displacement field to detect wave folding. Higher choppiness increases the likelihood of negative Jacobian values, which triggers foam rendering.

If you want foam without extreme choppiness, adjust the foam threshold in the ocean material instead.

### Small Wave Suppression and Detail Normals

The shader includes a detail normal layer for close-up ripple effects. If `Small Wave Suppression` removes too much detail from the simulation, increase the `Detail Normal Strength` in the material to compensate.

## Performance Considerations

Wave settings have minimal impact on runtime performance. The FFT simulation cost is determined by resolution (set on `OceanSimulator`), not by wave parameters.

However, some settings affect visual complexity:

| Setting | Performance Impact |
|---------|-------------------|
| High Choppiness | More foam pixels to shade |
| Low Small Wave Suppression | More high-frequency detail in normals |
| Large Pattern Size | No direct impact |

For VR, prioritize comfort settings over visual fidelity.

## Debugging Wave Issues

### Waves Look Too Uniform

- Decrease `Wind Alignment` for more chaotic patterns
- Increase `Wind Speed` to add more energy variation

### Waves Are Too Small

- Increase `Wind Speed`
- Ensure `Small Wave Suppression` is not too high
- Check that `Time Scale` is not near zero

### Visible Tiling at Distance

- Increase `Wave Pattern Size`
- Adjust camera far plane to limit visible ocean extent
- Use fog to obscure distant water

### Foam Appears Everywhere

- Reduce `Choppiness`
- Increase `Foam Threshold` in the ocean material
- Reduce `Wind Speed`

### Foam Never Appears

- Increase `Choppiness` toward 1.0
- Decrease `Foam Threshold` in the ocean material
- Increase `Wind Speed` to create steeper waves

## Next Steps

- [Visual Tuning](./visual-tuning) - Configure material colors and shader properties
- [Biome Profiles](./biome-profiles) - Profile management and switching
- [VR Performance](../optimization/vr-performance) - Optimize for Quest headsets