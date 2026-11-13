import React from "react";
import { Composition, type CalculateMetadataFunction } from "remotion";
import { useProjectFonts } from "./fonts";
import { VideoProjectSchema, type VideoProject } from "./types";
import { getCanvasDimensions } from "./utils/themeStyles";
import { VideoComposition } from "./VideoComposition";

export const COMPOSITION_ID = "VidyaMotionVideo";

export const DEFAULT_VIDEO_PROJECT: VideoProject = {
  id: "default-solar-panels",
  topic: "How Solar Panels Generate Electricity",
  language: "en-IN",
  theme: "cyber_dark",
  aspectRatio: "16:9",
  fps: 30,
  scenes: [
    {
      id: "scene-1-hero",
      type: "TITLE_HERO",
      heading: "How Solar Panels Turn Sunlight Into Power",
      subtext:
        "Discover the photovoltaic effect that transforms photons into clean electrical energy.",
      highlightWord: "CLEAN ENERGY",
      iconName: "Sun",
      narrationScript:
        "Ever wondered how sunlight becomes electricity? Let us explore the photovoltaic effect inside solar panels.",
      accentColor: "#06B6D4",
      durationInFrames: 150,
    },
    {
      id: "scene-2-split",
      type: "SPLIT_EXPLAINER",
      heading: "Inside a Silicon Solar Cell",
      subtext: "Two doped layers create an electric field.",
      bulletPoints: [
        "N-type silicon carries extra mobile electrons",
        "P-type silicon holds positively charged holes",
        "Photons knock electrons free across the junction",
      ],
      highlightWord: "SILICON WAFER",
      iconName: "Cpu",
      narrationScript:
        "Each solar cell sandwiches N-type and P-type silicon layers together, so incoming sunlight frees electrons across an electric field.",
      accentColor: "#38BDF8",
      durationInFrames: 180,
    },
    {
      id: "scene-3-metric",
      type: "KEY_METRIC_OR_FACT",
      heading: "Modern Commercial Panel Efficiency",
      subtext:
        "High-efficiency monocrystalline cells convert over a fifth of incoming solar energy into usable power.",
      highlightWord: "22.8%",
      iconName: "Zap",
      narrationScript:
        "Modern monocrystalline solar panels reach up to twenty two point eight percent conversion efficiency in bright sunlight.",
      accentColor: "#F59E0B",
      durationInFrames: 165,
    },
    {
      id: "scene-4-flow",
      type: "STEP_BY_STEP_FLOW",
      heading: "From Rooftop Photons to Home Appliances",
      subtext: "Three seamless conversion stages power your home.",
      bulletPoints: [
        "Capture: Solar cells generate direct current electricity",
        "Convert: An inverter transforms DC into grid AC power",
        "Distribute: Clean electricity runs appliances or charges batteries",
      ],
      highlightWord: "DC TO AC",
      iconName: "Workflow",
      narrationScript:
        "First, cells capture direct current. Next, an inverter converts it to alternating current for your home appliances.",
      accentColor: "#8B5CF6",
      durationInFrames: 180,
    },
    {
      id: "scene-5-summary",
      type: "SUMMARY_TAKEAWAY",
      heading: "Solar Power Essentials Recap",
      subtext: "Renewable, silent, and scalable power generation.",
      bulletPoints: [
        "Photons excite electrons across a silicon junction",
        "Inverters convert DC output into home-ready AC",
        "Zero moving parts enable decades of clean energy",
      ],
      highlightWord: "KEY TAKEAWAYS",
      iconName: "CheckCircle2",
      narrationScript:
        "To recap: sunlight frees electrons, inverters shape alternating current, and solar panels deliver silent clean power for decades.",
      accentColor: "#10B981",
      durationInFrames: 165,
    },
  ],
  totalDurationInFrames: 840,
};

export const calculateVideoMetadata: CalculateMetadataFunction<VideoProject> = ({
  props,
}) => {
  const { width, height } = getCanvasDimensions(props.aspectRatio ?? "16:9");
  const scenesDuration = (props.scenes ?? []).reduce(
    (sum, scene) => sum + Math.max(1, Math.round(scene.durationInFrames ?? 150)),
    0
  );
  const durationInFrames = Math.max(
    1,
    scenesDuration > 0 ? scenesDuration : props.totalDurationInFrames ?? 150
  );

  return {
    width,
    height,
    fps: props.fps ?? 30,
    durationInFrames,
    props: {
      ...props,
      totalDurationInFrames: durationInFrames,
    },
  };
};

export const RemotionRoot: React.FC = () => {
  useProjectFonts();

  return (
    <Composition
      id={COMPOSITION_ID}
      component={VideoComposition}
      schema={VideoProjectSchema}
      defaultProps={DEFAULT_VIDEO_PROJECT}
      calculateMetadata={calculateVideoMetadata}
    />
  );
};
