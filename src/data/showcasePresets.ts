import { VideoProjectSchema, type VideoProject } from "../remotion/types";

export interface ShowcasePreset {
  id: string;
  label: string;
  badge: string;
  languageLabel: string;
  project: VideoProject;
}

const RAW_SHOWCASE_PRESETS: ShowcasePreset[] = [
  {
    "id": "binary-search-trees",
    "label": "Binary Search Trees",
    "badge": "CS & Algorithms",
    "languageLabel": "English (IN)",
    "project": {
      "id": "showcase-binary-search-trees",
      "topic": "Binary Search Trees",
      "language": "en-IN",
      "theme": "clean_modern",
      "aspectRatio": "16:9",
      "fps": 30,
      "scenes": [
        {
          "id": "bst-1-hero",
          "type": "TITLE_HERO",
          "heading": "Binary Search Trees Explained",
          "subtext": "An ordered tree structure engineered for lightning-fast search, insert, and lookup.",
          "highlightWord": "O(log n) SEARCH",
          "iconName": "Network",
          "narrationScript": "Welcome! Today we explore Binary Search Trees, a foundational data structure built for ultra-fast searching and sorted data.",
          "accentColor": "#06B6D4",
          "durationInFrames": 320,
          "durationInSeconds": 10.152,
          "audioUrl": "/demos/binary-search-trees/scene-1.mp3",
          "captions": [
            {
              "text": "Welcome",
              "startMs": 100,
              "endMs": 813
            },
            {
              "text": "Today",
              "startMs": 1675,
              "endMs": 2025
            },
            {
              "text": "we",
              "startMs": 2038,
              "endMs": 2213
            },
            {
              "text": "explore",
              "startMs": 2225,
              "endMs": 2763
            },
            {
              "text": "Binary",
              "startMs": 2775,
              "endMs": 3275
            },
            {
              "text": "Search",
              "startMs": 3288,
              "endMs": 3700
            },
            {
              "text": "Trees",
              "startMs": 3713,
              "endMs": 4188
            },
            {
              "text": "a",
              "startMs": 4413,
              "endMs": 4538
            },
            {
              "text": "foundational",
              "startMs": 4550,
              "endMs": 5338
            },
            {
              "text": "data",
              "startMs": 5350,
              "endMs": 5700
            },
            {
              "text": "structure",
              "startMs": 5713,
              "endMs": 6250
            },
            {
              "text": "built",
              "startMs": 6263,
              "endMs": 6625
            },
            {
              "text": "for",
              "startMs": 6638,
              "endMs": 6913
            },
            {
              "text": "ultra-fast",
              "startMs": 6925,
              "endMs": 7650
            },
            {
              "text": "searching",
              "startMs": 7663,
              "endMs": 8200
            },
            {
              "text": "and",
              "startMs": 8213,
              "endMs": 8425
            },
            {
              "text": "sorted",
              "startMs": 8438,
              "endMs": 8838
            },
            {
              "text": "data",
              "startMs": 8850,
              "endMs": 9288
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const intro = Remotion.spring({ frame, fps, config: { damping: 14 } });\n    const pulse = Math.sin(frame * 0.08) * 4;\n    const padX = isPortrait ? \"40px\" : \"80px\";\n    const padB = isPortrait ? \"320px\" : \"210px\";\n    return (\n      <div style={{ display: \"flex\", flexDirection: \"column\", width: \"100%\", height: \"100%\", justifyContent: \"space-between\", padding: `60px ${padX} ${padB} ${padX}`, boxSizing: \"border-box\", fontFamily: \"Inter, system-ui, sans-serif\" }}>\n        <div style={{ textAlign: \"center\", marginBottom: isPortrait ? \"20px\" : \"16px\" }}>\n          <div style={{ display: \"inline-flex\", alignItems: \"center\", gap: \"8px\", padding: \"6px 16px\", borderRadius: \"999px\", backgroundColor: accentColor + \"22\", border: \"1px solid \" + accentColor + \"66\", color: accentColor, fontSize: isPortrait ? \"18px\" : \"16px\", fontWeight: 700, marginBottom: \"12px\" }}>\n            <Lucide.Network size={isPortrait ? 20 : 18} color={accentColor} />\n            <span>HIERARCHICAL DATA STRUCTURE</span>\n          </div>\n          <h1 style={{ fontSize: isPortrait ? \"42px\" : \"52px\", fontWeight: 800, color: palette.textPrimary, margin: \"0 0 10px 0\", lineHeight: 1.15 }}>{heading}</h1>\n          <p style={{ fontSize: isPortrait ? \"22px\" : \"24px\", color: palette.textSecondary, margin: 0, lineHeight: 1.45 }}>{subtext}</p>\n        </div>\n        <div style={{ flex: 1, width: \"100%\", maxHeight: isPortrait ? \"1050px\" : \"540px\", backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"28px\", padding: \"24px\", boxSizing: \"border-box\", display: \"flex\", alignItems: \"center\", justifyContent: \"center\", transform: `scale(${intro})`, boxShadow: \"0 16px 40px rgba(0,0,0,0.3)\" }}>\n          <svg viewBox={isPortrait ? \"0 0 600 750\" : \"0 0 720 400\"} style={{ width: \"100%\", height: \"100%\" }}>\n            {/* Tree Branch Edges */}\n            <line x1={isPortrait ? \"300\" : \"360\"} y1={isPortrait ? \"80\" : \"50\"} x2={isPortrait ? \"160\" : \"210\"} y2={isPortrait ? \"240\" : \"150\"} stroke={accentColor} strokeWidth=\"3.5\" strokeDasharray=\"8 6\" />\n            <line x1={isPortrait ? \"300\" : \"360\"} y1={isPortrait ? \"80\" : \"50\"} x2={isPortrait ? \"440\" : \"510\"} y2={isPortrait ? \"240\" : \"150\"} stroke={accentColor} strokeWidth=\"3.5\" strokeDasharray=\"8 6\" />\n            <line x1={isPortrait ? \"160\" : \"210\"} y1={isPortrait ? \"240\" : \"150\"} x2={isPortrait ? \"90\" : \"130\"} y2={isPortrait ? \"420\" : \"250\"} stroke=\"#38BDF8\" strokeWidth=\"2.5\" />\n            <line x1={isPortrait ? \"160\" : \"210\"} y1={isPortrait ? \"240\" : \"150\"} x2={isPortrait ? \"230\" : \"290\"} y2={isPortrait ? \"420\" : \"250\"} stroke=\"#38BDF8\" strokeWidth=\"2.5\" />\n            <line x1={isPortrait ? \"440\" : \"510\"} y1={isPortrait ? \"240\" : \"150\"} x2={isPortrait ? \"370\" : \"430\"} y2={isPortrait ? \"420\" : \"250\"} stroke=\"#38BDF8\" strokeWidth=\"2.5\" />\n            <line x1={isPortrait ? \"440\" : \"510\"} y1={isPortrait ? \"240\" : \"150\"} x2={isPortrait ? \"510\" : \"590\"} y2={isPortrait ? \"420\" : \"250\"} stroke=\"#38BDF8\" strokeWidth=\"2.5\" />\n\n            {/* Root Node (50) */}\n            <circle cx={isPortrait ? \"300\" : \"360\"} cy={isPortrait ? \"80\" : \"50\"} r={32 + pulse} fill={accentColor} opacity=\"0.2\" />\n            <circle cx={isPortrait ? \"300\" : \"360\"} cy={isPortrait ? \"80\" : \"50\"} r=\"28\" fill=\"#0F172A\" stroke={accentColor} strokeWidth=\"3.5\" />\n            <text x={isPortrait ? \"300\" : \"360\"} y={isPortrait ? \"88\" : \"58\"} fill=\"#FFFFFF\" fontSize=\"22\" fontWeight=\"bold\" textAnchor=\"middle\">50</text>\n\n            {/* Level 1 Nodes (25, 75) */}\n            <circle cx={isPortrait ? \"160\" : \"210\"} cy={isPortrait ? \"240\" : \"150\"} r=\"24\" fill=\"#0F172A\" stroke=\"#38BDF8\" strokeWidth=\"3\" />\n            <text x={isPortrait ? \"160\" : \"210\"} y={isPortrait ? \"247\" : \"157\"} fill=\"#FFFFFF\" fontSize=\"18\" fontWeight=\"bold\" textAnchor=\"middle\">25</text>\n            <circle cx={isPortrait ? \"440\" : \"510\"} cy={isPortrait ? \"240\" : \"150\"} r=\"24\" fill=\"#0F172A\" stroke=\"#38BDF8\" strokeWidth=\"3\" />\n            <text x={isPortrait ? \"440\" : \"510\"} y={isPortrait ? \"247\" : \"157\"} fill=\"#FFFFFF\" fontSize=\"18\" fontWeight=\"bold\" textAnchor=\"middle\">75</text>\n\n            {/* Leaf Nodes */}\n            <circle cx={isPortrait ? \"90\" : \"130\"} cy={isPortrait ? \"420\" : \"250\"} r=\"18\" fill=\"#0F172A\" stroke={accentColor} strokeWidth=\"2\" />\n            <text x={isPortrait ? \"90\" : \"130\"} y={isPortrait ? \"426\" : \"256\"} fill=\"#E2E8F0\" fontSize=\"14\" fontWeight=\"bold\" textAnchor=\"middle\">10</text>\n            <circle cx={isPortrait ? \"230\" : \"290\"} cy={isPortrait ? \"420\" : \"250\"} r=\"18\" fill=\"#0F172A\" stroke={accentColor} strokeWidth=\"2\" />\n            <text x={isPortrait ? \"230\" : \"290\"} y={isPortrait ? \"426\" : \"256\"} fill=\"#E2E8F0\" fontSize=\"14\" fontWeight=\"bold\" textAnchor=\"middle\">35</text>\n            <circle cx={isPortrait ? \"370\" : \"430\"} cy={isPortrait ? \"420\" : \"250\"} r=\"18\" fill=\"#0F172A\" stroke={accentColor} strokeWidth=\"2\" />\n            <text x={isPortrait ? \"370\" : \"430\"} y={isPortrait ? \"426\" : \"256\"} fill=\"#E2E8F0\" fontSize=\"14\" fontWeight=\"bold\" textAnchor=\"middle\">60</text>\n            <circle cx={isPortrait ? \"510\" : \"590\"} cy={isPortrait ? \"420\" : \"250\"} r=\"18\" fill=\"#0F172A\" stroke={accentColor} strokeWidth=\"2\" />\n            <text x={isPortrait ? \"510\" : \"590\"} y={isPortrait ? \"426\" : \"256\"} fill=\"#E2E8F0\" fontSize=\"14\" fontWeight=\"bold\" textAnchor=\"middle\">90</text>\n\n            {/* Mathematical Invariant Banner - High Contrast Deep Slate & Vibrant Text */}\n            <rect x={isPortrait ? \"50\" : \"110\"} y={isPortrait ? \"580\" : \"330\"} width={isPortrait ? \"500\" : \"500\"} height=\"50\" rx=\"14\" fill=\"#090D16\" stroke={accentColor} strokeWidth=\"2\" />\n            <text x={isPortrait ? \"300\" : \"360\"} y={isPortrait ? \"612\" : \"362\"} fill=\"#38BDF8\" fontSize=\"16\" fontWeight=\"800\" textAnchor=\"middle\">INVARIANT: Left &lt; Node &lt; Right</text>\n          </svg>\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        },
        {
          "id": "bst-2-rule",
          "type": "SPLIT_EXPLAINER",
          "heading": "The Core Ordering Property",
          "subtext": "Every node enforces strict directional order across its left and right subtrees.",
          "bulletPoints": [
            "Left subtree holds only keys smaller than the parent node",
            "Right subtree holds only keys larger than the parent node",
            "Each comparison eliminates half of the remaining tree"
          ],
          "highlightWord": "ORDERED NODES",
          "iconName": "Binary",
          "narrationScript": "At every node, smaller values always go to the left branch and larger values go to the right, cutting the search space in half at each step.",
          "accentColor": "#38BDF8",
          "durationInFrames": 323,
          "durationInSeconds": 10.248,
          "audioUrl": "/demos/binary-search-trees/scene-2.mp3",
          "captions": [
            {
              "text": "At",
              "startMs": 100,
              "endMs": 363
            },
            {
              "text": "every",
              "startMs": 375,
              "endMs": 713
            },
            {
              "text": "node",
              "startMs": 725,
              "endMs": 1113
            },
            {
              "text": "smaller",
              "startMs": 1238,
              "endMs": 1738
            },
            {
              "text": "values",
              "startMs": 1750,
              "endMs": 2250
            },
            {
              "text": "always",
              "startMs": 2263,
              "endMs": 2750
            },
            {
              "text": "go",
              "startMs": 2763,
              "endMs": 2975
            },
            {
              "text": "to",
              "startMs": 2988,
              "endMs": 3088
            },
            {
              "text": "the",
              "startMs": 3100,
              "endMs": 3188
            },
            {
              "text": "left",
              "startMs": 3200,
              "endMs": 3563
            },
            {
              "text": "branch",
              "startMs": 3575,
              "endMs": 4138
            },
            {
              "text": "and",
              "startMs": 4150,
              "endMs": 4375
            },
            {
              "text": "larger",
              "startMs": 4388,
              "endMs": 4825
            },
            {
              "text": "values",
              "startMs": 4838,
              "endMs": 5338
            },
            {
              "text": "go",
              "startMs": 5350,
              "endMs": 5575
            },
            {
              "text": "to",
              "startMs": 5588,
              "endMs": 5700
            },
            {
              "text": "the",
              "startMs": 5713,
              "endMs": 5800
            },
            {
              "text": "right",
              "startMs": 5813,
              "endMs": 6250
            },
            {
              "text": "cutting",
              "startMs": 6513,
              "endMs": 6900
            },
            {
              "text": "the",
              "startMs": 6913,
              "endMs": 7000
            },
            {
              "text": "search",
              "startMs": 7013,
              "endMs": 7388
            },
            {
              "text": "space",
              "startMs": 7400,
              "endMs": 7875
            },
            {
              "text": "in",
              "startMs": 7888,
              "endMs": 8038
            },
            {
              "text": "half",
              "startMs": 8050,
              "endMs": 8388
            },
            {
              "text": "at",
              "startMs": 8400,
              "endMs": 8700
            },
            {
              "text": "each",
              "startMs": 8713,
              "endMs": 8963
            },
            {
              "text": "step",
              "startMs": 8975,
              "endMs": 9388
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const intro = Remotion.spring({ frame, fps, config: { damping: 14 } });\n    const cycle = (frame % 60) / 60;\n    const pulse = Math.sin(frame * 0.1) * 3;\n    const padX = isPortrait ? \"40px\" : \"80px\";\n    const padB = isPortrait ? \"320px\" : \"210px\";\n    return (\n      <div style={{ display: \"flex\", flexDirection: \"column\", width: \"100%\", height: \"100%\", justifyContent: \"space-between\", padding: `60px ${padX} ${padB} ${padX}`, boxSizing: \"border-box\", fontFamily: \"Inter, system-ui, sans-serif\" }}>\n        <div style={{ textAlign: \"center\", marginBottom: isPortrait ? \"20px\" : \"16px\" }}>\n          <div style={{ display: \"inline-flex\", alignItems: \"center\", gap: \"8px\", padding: \"6px 16px\", borderRadius: \"999px\", backgroundColor: accentColor + \"22\", border: \"1px solid \" + accentColor + \"66\", color: accentColor, fontSize: isPortrait ? \"18px\" : \"16px\", fontWeight: 700, marginBottom: \"12px\" }}>\n            <Lucide.Binary size={isPortrait ? 20 : 18} color={accentColor} />\n            <span>BINARY DECISION PARTITION</span>\n          </div>\n          <h1 style={{ fontSize: isPortrait ? \"42px\" : \"52px\", fontWeight: 800, color: palette.textPrimary, margin: \"0 0 10px 0\", lineHeight: 1.15 }}>{heading}</h1>\n          <p style={{ fontSize: isPortrait ? \"22px\" : \"24px\", color: palette.textSecondary, margin: 0, lineHeight: 1.45 }}>{subtext}</p>\n        </div>\n        <div style={{ flex: 1, width: \"100%\", maxHeight: isPortrait ? \"1050px\" : \"540px\", backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"28px\", padding: \"24px\", boxSizing: \"border-box\", display: \"flex\", alignItems: \"center\", justifyContent: \"center\", transform: `scale(${intro})`, boxShadow: \"0 16px 40px rgba(0,0,0,0.3)\" }}>\n          <svg viewBox={isPortrait ? \"0 0 600 750\" : \"0 0 720 390\"} style={{ width: \"100%\", height: \"100%\" }}>\n            {/* Center Decision Node */}\n            <rect x={isPortrait ? \"180\" : \"250\"} y={isPortrait ? \"80\" : \"30\"} width={isPortrait ? \"240\" : \"220\"} height=\"80\" rx=\"16\" fill=\"#0F172A\" stroke={accentColor} strokeWidth=\"3\" />\n            <text x={isPortrait ? \"300\" : \"360\"} y={isPortrait ? \"122\" : \"72\"} fill=\"#FFFFFF\" fontSize=\"20\" fontWeight=\"bold\" textAnchor=\"middle\">PARENT (Key K)</text>\n            <text x={isPortrait ? \"300\" : \"360\"} y={isPortrait ? \"146\" : \"96\"} fill=\"#38BDF8\" fontSize=\"14\" textAnchor=\"middle\">Comparison Target</text>\n\n            {/* Left Branch -> Smaller */}\n            <path d={isPortrait ? \"M 220 160 L 120 280\" : \"M 270 110 L 150 170\"} fill=\"none\" stroke=\"#10B981\" strokeWidth=\"4\" strokeDasharray=\"8 6\" />\n            <rect x={isPortrait ? \"40\" : \"50\"} y={isPortrait ? \"280\" : \"170\"} width={isPortrait ? \"220\" : \"190\"} height=\"95\" rx=\"16\" fill=\"#061A12\" stroke=\"#10B981\" strokeWidth=\"2.5\" />\n            <text x={isPortrait ? \"150\" : \"145\"} y={isPortrait ? \"325\" : \"215\"} fill=\"#10B981\" fontSize=\"18\" fontWeight=\"bold\" textAnchor=\"middle\">LEFT SUBTREE</text>\n            <text x={isPortrait ? \"150\" : \"145\"} y={isPortrait ? \"355\" : \"245\"} fill=\"#A7F3D0\" fontSize=\"15\" textAnchor=\"middle\">All Keys &lt; K</text>\n\n            {/* Right Branch -> Greater */}\n            <path d={isPortrait ? \"M 380 160 L 480 280\" : \"M 450 110 L 570 170\"} fill=\"none\" stroke=\"#F59E0B\" strokeWidth=\"4\" strokeDasharray=\"8 6\" />\n            <rect x={isPortrait ? \"340\" : \"480\"} y={isPortrait ? \"280\" : \"170\"} width={isPortrait ? \"220\" : \"190\"} height=\"95\" rx=\"16\" fill=\"#1C1304\" stroke=\"#F59E0B\" strokeWidth=\"2.5\" />\n            <text x={isPortrait ? \"450\" : \"575\"} y={isPortrait ? \"325\" : \"215\"} fill=\"#F59E0B\" fontSize=\"18\" fontWeight=\"bold\" textAnchor=\"middle\">RIGHT SUBTREE</text>\n            <text x={isPortrait ? \"450\" : \"575\"} y={isPortrait ? \"355\" : \"245\"} fill=\"#FDE68A\" fontSize=\"15\" textAnchor=\"middle\">All Keys &gt; K</text>\n\n            {/* Dynamic Comparison Pulse */}\n            <circle cx={isPortrait ? 220 - cycle * 100 : 270 - cycle * 120} cy={isPortrait ? 160 + cycle * 120 : 110 + cycle * 60} r=\"7\" fill=\"#10B981\" />\n            <circle cx={isPortrait ? 380 + cycle * 100 : 450 + cycle * 120} cy={isPortrait ? 160 + cycle * 120 : 110 + cycle * 60} r=\"7\" fill=\"#F59E0B\" />\n\n            {/* Bottom Invariant Banner - High Contrast Deep Slate & Vibrant White/Cyan */}\n            <rect x={isPortrait ? \"50\" : \"70\"} y={isPortrait ? \"520\" : \"295\"} width={isPortrait ? \"500\" : \"580\"} height=\"52\" rx=\"14\" fill=\"#090D16\" stroke=\"#38BDF8\" strokeWidth=\"2\" />\n            <text x={isPortrait ? \"300\" : \"360\"} y={isPortrait ? \"552\" : \"327\"} fill=\"#FFFFFF\" fontSize=\"16\" fontWeight=\"bold\" textAnchor=\"middle\">\n              Every Comparison Eliminates 50% of the Remaining Tree\n            </text>\n          </svg>\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        },
        {
          "id": "bst-3-flow",
          "type": "STEP_BY_STEP_FLOW",
          "heading": "How Search Finds a Target Key",
          "subtext": "Three deterministic hops guide traversal straight to the answer.",
          "bulletPoints": [
            "Compare: Check target against the current root key",
            "Branch: Step left if smaller, or right if larger",
            "Locate: Stop at exact match or insert at empty leaf"
          ],
          "highlightWord": "3-STEP LOOKUP",
          "iconName": "Search",
          "narrationScript": "Searching works in three clear steps: compare with the root, branch left or right, and repeat until you match the target key.",
          "accentColor": "#8B5CF6",
          "durationInFrames": 286,
          "durationInSeconds": 9.024,
          "audioUrl": "/demos/binary-search-trees/scene-3.mp3",
          "captions": [
            {
              "text": "Searching",
              "startMs": 100,
              "endMs": 738
            },
            {
              "text": "works",
              "startMs": 750,
              "endMs": 1100
            },
            {
              "text": "in",
              "startMs": 1113,
              "endMs": 1238
            },
            {
              "text": "three",
              "startMs": 1250,
              "endMs": 1538
            },
            {
              "text": "clear",
              "startMs": 1550,
              "endMs": 1875
            },
            {
              "text": "steps",
              "startMs": 1888,
              "endMs": 2400
            },
            {
              "text": "compare",
              "startMs": 2613,
              "endMs": 3150
            },
            {
              "text": "with",
              "startMs": 3163,
              "endMs": 3300
            },
            {
              "text": "the",
              "startMs": 3313,
              "endMs": 3400
            },
            {
              "text": "root",
              "startMs": 3413,
              "endMs": 3813
            },
            {
              "text": "branch",
              "startMs": 3963,
              "endMs": 4425
            },
            {
              "text": "left",
              "startMs": 4438,
              "endMs": 4800
            },
            {
              "text": "or",
              "startMs": 4813,
              "endMs": 4963
            },
            {
              "text": "right",
              "startMs": 4975,
              "endMs": 5388
            },
            {
              "text": "and",
              "startMs": 5575,
              "endMs": 5825
            },
            {
              "text": "repeat",
              "startMs": 5838,
              "endMs": 6325
            },
            {
              "text": "until",
              "startMs": 6338,
              "endMs": 6688
            },
            {
              "text": "you",
              "startMs": 6700,
              "endMs": 6813
            },
            {
              "text": "match",
              "startMs": 6825,
              "endMs": 7188
            },
            {
              "text": "the",
              "startMs": 7200,
              "endMs": 7325
            },
            {
              "text": "target",
              "startMs": 7338,
              "endMs": 7775
            },
            {
              "text": "key",
              "startMs": 7788,
              "endMs": 8163
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const intro = Remotion.spring({ frame, fps, config: { damping: 14 } });\n    const count = Remotion.interpolate(frame, [0, 45], [1, 20], { extrapolateRight: \"clamp\" });\n    const padX = isPortrait ? \"40px\" : \"80px\";\n    const padB = isPortrait ? \"320px\" : \"210px\";\n    return (\n      <div style={{ display: \"flex\", flexDirection: \"column\", width: \"100%\", height: \"100%\", justifyContent: \"space-between\", padding: `60px ${padX} ${padB} ${padX}`, boxSizing: \"border-box\", fontFamily: \"Inter, system-ui, sans-serif\" }}>\n        <div style={{ textAlign: \"center\", marginBottom: isPortrait ? \"20px\" : \"16px\" }}>\n          <div style={{ display: \"inline-flex\", alignItems: \"center\", gap: \"8px\", padding: \"6px 16px\", borderRadius: \"999px\", backgroundColor: accentColor + \"22\", border: \"1px solid \" + accentColor + \"66\", color: accentColor, fontSize: isPortrait ? \"18px\" : \"16px\", fontWeight: 700, marginBottom: \"12px\" }}>\n            <Lucide.Gauge size={isPortrait ? 20 : 18} color={accentColor} />\n            <span>ALGORITHMIC COMPLEXITY SCALING</span>\n          </div>\n          <h1 style={{ fontSize: isPortrait ? \"42px\" : \"52px\", fontWeight: 800, color: palette.textPrimary, margin: \"0 0 10px 0\", lineHeight: 1.15 }}>{heading}</h1>\n          <p style={{ fontSize: isPortrait ? \"22px\" : \"24px\", color: palette.textSecondary, margin: 0, lineHeight: 1.45 }}>{subtext}</p>\n        </div>\n        <div style={{ flex: 1, width: \"100%\", maxHeight: isPortrait ? \"1050px\" : \"540px\", backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"28px\", padding: \"24px\", boxSizing: \"border-box\", display: \"flex\", alignItems: \"center\", justifyContent: \"center\", transform: `scale(${intro})`, boxShadow: \"0 16px 40px rgba(0,0,0,0.3)\" }}>\n          <svg viewBox={isPortrait ? \"0 0 600 750\" : \"0 0 720 390\"} style={{ width: \"100%\", height: \"100%\" }}>\n            {/* Metric Comparison Gauges */}\n            <rect x={isPortrait ? \"60\" : \"60\"} y={isPortrait ? \"80\" : \"40\"} width={isPortrait ? \"480\" : \"270\"} height={isPortrait ? \"180\" : \"220\"} rx=\"20\" fill=\"#0C1B2A\" stroke=\"#38BDF8\" strokeWidth=\"2.5\" />\n            <text x={isPortrait ? \"300\" : \"195\"} y={isPortrait ? \"130\" : \"88\"} fill=\"#38BDF8\" fontSize=\"20\" fontWeight=\"bold\" textAnchor=\"middle\">BALANCED BST</text>\n            <text x={isPortrait ? \"300\" : \"195\"} y={isPortrait ? \"190\" : \"155\"} fill=\"#FFFFFF\" fontSize=\"42\" fontWeight=\"800\" textAnchor=\"middle\">O(log n)</text>\n            <text x={isPortrait ? \"300\" : \"195\"} y={isPortrait ? \"230\" : \"205\"} fill=\"#94A3B8\" fontSize=\"16\" textAnchor=\"middle\">1,000,000 items in ~{Math.round(count)} checks</text>\n\n            <rect x={isPortrait ? \"60\" : \"390\"} y={isPortrait ? \"300\" : \"40\"} width={isPortrait ? \"480\" : \"270\"} height={isPortrait ? \"180\" : \"220\"} rx=\"20\" fill=\"#240D12\" stroke=\"#F43F5E\" strokeWidth=\"2.5\" />\n            <text x={isPortrait ? \"300\" : \"525\"} y={isPortrait ? \"350\" : \"88\"} fill=\"#F43F5E\" fontSize=\"20\" fontWeight=\"bold\" textAnchor=\"middle\">LINEAR ARRAY</text>\n            <text x={isPortrait ? \"300\" : \"525\"} y={isPortrait ? \"410\" : \"155\"} fill=\"#FFFFFF\" fontSize=\"42\" fontWeight=\"800\" textAnchor=\"middle\">O(n)</text>\n            <text x={isPortrait ? \"300\" : \"525\"} y={isPortrait ? \"450\" : \"205\"} fill=\"#FDA4AF\" fontSize=\"16\" textAnchor=\"middle\">1,000,000 items in 1,000,000 checks</text>\n\n            {/* Speed Advantage Callout - Solid high-contrast deep badge */}\n            <rect x={isPortrait ? \"60\" : \"70\"} y={isPortrait ? \"540\" : \"285\"} width={isPortrait ? \"480\" : \"580\"} height={isPortrait ? \"65\" : \"54\"} rx=\"14\" fill=\"#090D16\" stroke=\"#8B5CF6\" strokeWidth=\"2\" />\n            <text x={isPortrait ? \"300\" : \"360\"} y={isPortrait ? \"582\" : \"319\"} fill=\"#DDD6FE\" fontSize={isPortrait ? \"18\" : \"16\"} fontWeight=\"bold\" textAnchor=\"middle\">\n              50,000x Speedup on Large-Scale Datasets\n            </text>\n          </svg>\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        },
        {
          "id": "bst-4-summary",
          "type": "SUMMARY_TAKEAWAY",
          "heading": "Why Developers Love BSTs",
          "subtext": "Balanced trees power databases, indexes, and autocomplete engines.",
          "bulletPoints": [
            "Balanced lookups run in logarithmic O(log n) time",
            "In-order traversal yields elements in sorted sequence",
            "Powers database B-trees, file systems, and routing tables"
          ],
          "highlightWord": "KEY TAKEAWAYS",
          "iconName": "CheckCircle2",
          "narrationScript": "To sum up: balanced Binary Search Trees give fast logarithmic lookups, sorted traversal, and power modern database indexes.",
          "accentColor": "#10B981",
          "durationInFrames": 306,
          "durationInSeconds": 9.696,
          "audioUrl": "/demos/binary-search-trees/scene-4.mp3",
          "captions": [
            {
              "text": "To",
              "startMs": 100,
              "endMs": 263
            },
            {
              "text": "sum",
              "startMs": 275,
              "endMs": 563
            },
            {
              "text": "up",
              "startMs": 575,
              "endMs": 825
            },
            {
              "text": "balanced",
              "startMs": 1000,
              "endMs": 1563
            },
            {
              "text": "Binary",
              "startMs": 1575,
              "endMs": 2063
            },
            {
              "text": "Search",
              "startMs": 2075,
              "endMs": 2475
            },
            {
              "text": "Trees",
              "startMs": 2488,
              "endMs": 2850
            },
            {
              "text": "give",
              "startMs": 2863,
              "endMs": 3050
            },
            {
              "text": "fast",
              "startMs": 3063,
              "endMs": 3463
            },
            {
              "text": "logarithmic",
              "startMs": 3475,
              "endMs": 4113
            },
            {
              "text": "lookups",
              "startMs": 4125,
              "endMs": 4675
            },
            {
              "text": "sorted",
              "startMs": 4913,
              "endMs": 5400
            },
            {
              "text": "traversal",
              "startMs": 5413,
              "endMs": 6150
            },
            {
              "text": "and",
              "startMs": 6363,
              "endMs": 6613
            },
            {
              "text": "power",
              "startMs": 6625,
              "endMs": 6950
            },
            {
              "text": "modern",
              "startMs": 6963,
              "endMs": 7413
            },
            {
              "text": "database",
              "startMs": 7425,
              "endMs": 8075
            },
            {
              "text": "indexes",
              "startMs": 8088,
              "endMs": 8825
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const intro = Remotion.spring({ frame, fps, config: { damping: 14 } });\n    const pulse = Math.sin(frame * 0.1) * 4;\n    const padX = isPortrait ? \"40px\" : \"80px\";\n    const padB = isPortrait ? \"320px\" : \"210px\";\n    return (\n      <div style={{ display: \"flex\", flexDirection: \"column\", width: \"100%\", height: \"100%\", justifyContent: \"space-between\", padding: `60px ${padX} ${padB} ${padX}`, boxSizing: \"border-box\", fontFamily: \"Inter, system-ui, sans-serif\" }}>\n        <div style={{ textAlign: \"center\", marginBottom: isPortrait ? \"20px\" : \"16px\" }}>\n          <div style={{ display: \"inline-flex\", alignItems: \"center\", gap: \"8px\", padding: \"6px 16px\", borderRadius: \"999px\", backgroundColor: accentColor + \"22\", border: \"1px solid \" + accentColor + \"66\", color: accentColor, fontSize: isPortrait ? \"18px\" : \"16px\", fontWeight: 700, marginBottom: \"12px\" }}>\n            <Lucide.Database size={isPortrait ? 20 : 18} color={accentColor} />\n            <span>PRODUCTION SYSTEM INTEGRATIONS</span>\n          </div>\n          <h1 style={{ fontSize: isPortrait ? \"42px\" : \"52px\", fontWeight: 800, color: palette.textPrimary, margin: \"0 0 10px 0\", lineHeight: 1.15 }}>{heading}</h1>\n          <p style={{ fontSize: isPortrait ? \"22px\" : \"24px\", color: palette.textSecondary, margin: 0, lineHeight: 1.45 }}>{subtext}</p>\n        </div>\n        <div style={{ flex: 1, width: \"100%\", maxHeight: isPortrait ? \"1050px\" : \"540px\", backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"28px\", padding: \"24px\", boxSizing: \"border-box\", display: \"flex\", alignItems: \"center\", justifyContent: \"center\", transform: `scale(${intro})`, boxShadow: \"0 16px 40px rgba(0,0,0,0.3)\" }}>\n          <svg viewBox={isPortrait ? \"0 0 600 750\" : \"0 0 720 390\"} style={{ width: \"100%\", height: \"100%\" }}>\n            {/* System 1: DB Indexing */}\n            <rect x={isPortrait ? \"60\" : \"40\"} y={isPortrait ? \"60\" : \"50\"} width={isPortrait ? \"480\" : \"200\"} height={isPortrait ? \"130\" : \"195\"} rx=\"18\" fill=\"#0F172A\" stroke=\"#10B981\" strokeWidth=\"2.5\" />\n            <text x={isPortrait ? \"300\" : \"140\"} y={isPortrait ? \"110\" : \"110\"} fill=\"#10B981\" fontSize=\"19\" fontWeight=\"bold\" textAnchor=\"middle\">DB INDEXES</text>\n            <text x={isPortrait ? \"300\" : \"140\"} y={isPortrait ? \"145\" : \"150\"} fill=\"#94A3B8\" fontSize=\"15\" textAnchor=\"middle\">B-Trees &amp; PostgreSQL</text>\n\n            {/* System 2: Language Runtimes */}\n            <rect x={isPortrait ? \"60\" : \"260\"} y={isPortrait ? \"220\" : \"50\"} width={isPortrait ? \"480\" : \"200\"} height={isPortrait ? \"130\" : \"195\"} rx=\"18\" fill=\"#0F172A\" stroke=\"#38BDF8\" strokeWidth=\"2.5\" />\n            <text x={isPortrait ? \"300\" : \"360\"} y={isPortrait ? \"270\" : \"110\"} fill=\"#38BDF8\" fontSize=\"19\" fontWeight=\"bold\" textAnchor=\"middle\">RUNTIMES</text>\n            <text x={isPortrait ? \"300\" : \"360\"} y={isPortrait ? \"305\" : \"150\"} fill=\"#94A3B8\" fontSize=\"15\" textAnchor=\"middle\">std::map &amp; TreeSet</text>\n\n            {/* System 3: Routers & OS */}\n            <rect x={isPortrait ? \"60\" : \"480\"} y={isPortrait ? \"380\" : \"50\"} width={isPortrait ? \"480\" : \"200\"} height={isPortrait ? \"130\" : \"195\"} rx=\"18\" fill=\"#0F172A\" stroke=\"#F59E0B\" strokeWidth=\"2.5\" />\n            <text x={isPortrait ? \"300\" : \"580\"} y={isPortrait ? \"430\" : \"110\"} fill=\"#F59E0B\" fontSize=\"19\" fontWeight=\"bold\" textAnchor=\"middle\">NETWORK ROUTING</text>\n            <text x={isPortrait ? \"300\" : \"580\"} y={isPortrait ? \"465\" : \"150\"} fill=\"#94A3B8\" fontSize=\"15\" textAnchor=\"middle\">CIDR IP Lookup Trees</text>\n\n            {/* Invariant Footer Banner - Solid high-contrast deep slate */}\n            <rect x={isPortrait ? \"60\" : \"70\"} y={isPortrait ? \"560\" : \"275\"} width={isPortrait ? \"480\" : \"580\"} height={isPortrait ? \"65\" : \"54\"} rx=\"14\" fill=\"#090D16\" stroke=\"#10B981\" strokeWidth=\"2\" />\n            <text x={isPortrait ? \"300\" : \"360\"} y={isPortrait ? \"600\" : \"309\"} fill=\"#A7F3D0\" fontSize={isPortrait ? \"17\" : \"16\"} fontWeight=\"bold\" textAnchor=\"middle\">\n              The Bedrock of High-Performance Modern Computing\n            </text>\n          </svg>\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        }
      ],
      "totalDurationInFrames": 1235
    }
  },
  {
    "id": "photosynthesis-hi",
    "label": "प्रकाश संश्लेषण",
    "badge": "जीव विज्ञान",
    "languageLabel": "हिन्दी (Hindi)",
    "project": {
      "id": "showcase-photosynthesis-hi",
      "topic": "प्रकाश संश्लेषण (Photosynthesis)",
      "language": "hi-IN",
      "theme": "emerald_nature",
      "aspectRatio": "16:9",
      "fps": 30,
      "scenes": [
        {
          "id": "photo-1-hero",
          "type": "TITLE_HERO",
          "heading": "प्रकाश संश्लेषण: जीवन की सौर ऊर्जा",
          "subtext": "पौधे सूर्य के प्रकाश, पानी और कार्बन डाइऑक्साइड से अपना भोजन स्वयं बनाते हैं।",
          "highlightWord": "हरित ऊर्जा",
          "iconName": "Leaf",
          "narrationScript": "नमस्ते! आइए समझते हैं कि पौधे प्रकाश संश्लेषण के द्वारा सूर्य की रोशनी से अपना भोजन और ऑक्सीजन कैसे बनाते हैं।",
          "accentColor": "#10B981",
          "durationInFrames": 344,
          "durationInSeconds": 10.944,
          "audioUrl": "/demos/photosynthesis-hi/scene-1.mp3",
          "captions": [
            {
              "text": "नमस्ते",
              "startMs": 100,
              "endMs": 950
            },
            {
              "text": "आइए",
              "startMs": 1813,
              "endMs": 2275
            },
            {
              "text": "समझते",
              "startMs": 2288,
              "endMs": 2800
            },
            {
              "text": "हैं",
              "startMs": 2813,
              "endMs": 3250
            },
            {
              "text": "कि",
              "startMs": 3263,
              "endMs": 3525
            },
            {
              "text": "पौधे",
              "startMs": 3538,
              "endMs": 3963
            },
            {
              "text": "प्रकाश",
              "startMs": 3975,
              "endMs": 4438
            },
            {
              "text": "संश्लेषण",
              "startMs": 4450,
              "endMs": 5138
            },
            {
              "text": "के",
              "startMs": 5150,
              "endMs": 5300
            },
            {
              "text": "द्वारा",
              "startMs": 5313,
              "endMs": 5725
            },
            {
              "text": "सूर्य",
              "startMs": 5738,
              "endMs": 6163
            },
            {
              "text": "की",
              "startMs": 6175,
              "endMs": 6338
            },
            {
              "text": "रोशनी",
              "startMs": 6350,
              "endMs": 6863
            },
            {
              "text": "से",
              "startMs": 6875,
              "endMs": 7125
            },
            {
              "text": "अपना",
              "startMs": 7138,
              "endMs": 7513
            },
            {
              "text": "भोजन",
              "startMs": 7525,
              "endMs": 7975
            },
            {
              "text": "और",
              "startMs": 7988,
              "endMs": 8263
            },
            {
              "text": "ऑक्सीजन",
              "startMs": 8275,
              "endMs": 8900
            },
            {
              "text": "कैसे",
              "startMs": 8913,
              "endMs": 9275
            },
            {
              "text": "बनाते",
              "startMs": 9288,
              "endMs": 9713
            },
            {
              "text": "हैं",
              "startMs": 9725,
              "endMs": 10063
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const intro = Remotion.spring({ frame, fps, config: { damping: 14 } });\n    const sunRay = (frame % 45) / 45;\n    return (\n      <div style={{ display: \"flex\", flexDirection: isPortrait ? \"column\" : \"row\", width: \"100%\", height: \"100%\", alignItems: \"center\", justifyContent: \"space-between\", padding: isPortrait ? \"60px 48px 300px 48px\" : \"60px 80px 180px\", boxSizing: \"border-box\" }}>\n        <div style={{ flex: 1, maxWidth: isPortrait ? \"100%\" : \"48%\" }}>\n          <div style={{ display: \"inline-flex\", alignItems: \"center\", gap: \"8px\", padding: \"6px 14px\", borderRadius: \"999px\", backgroundColor: accentColor + \"22\", border: \"1px solid \" + accentColor + \"66\", color: accentColor, fontSize: \"16px\", fontWeight: 700, marginBottom: \"16px\" }}>\n            <Lucide.Leaf size={18} color={accentColor} />\n            <span>जैव विज्ञान</span>\n          </div>\n          <h1 style={{ fontSize: isPortrait ? \"36px\" : \"50px\", fontWeight: 800, color: palette.textPrimary, margin: \"0 0 16px 0\", lineHeight: 1.2 }}>{heading}</h1>\n          <p style={{ fontSize: isPortrait ? \"20px\" : \"24px\", color: palette.textSecondary, margin: 0, lineHeight: 1.5 }}>{subtext}</p>\n        </div>\n        <div style={{ flex: 1, width: \"100%\", maxWidth: isPortrait ? \"100%\" : \"48%\", maxHeight: isPortrait ? \"1050px\" : \"540px\", flex: 1, backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"24px\", padding: \"20px\", boxSizing: \"border-box\", display: \"flex\", alignItems: \"center\", justifyContent: \"center\", transform: \"scale(\" + intro + \")\" }}>\n          <svg viewBox=\"0 0 400 320\" style={{ width: \"100%\", height: \"100%\" }}>\n            <circle cx=\"80\" cy=\"60\" r=\"36\" fill=\"#FDE047\" opacity=\"0.9\" />\n            <line x1=\"80\" y1=\"100\" x2={140 + sunRay * 40} y2={180 + sunRay * 30} stroke=\"#FDE047\" strokeWidth=\"4\" strokeLinecap=\"round\" />\n            <path d=\"M 120 250 C 140 140, 320 130, 360 210 C 330 290, 180 290, 120 250 Z\" fill=\"#059669\" stroke=\"#10B981\" strokeWidth=\"4\" />\n            <path d=\"M 140 245 Q 240 210 340 215\" fill=\"none\" stroke=\"#A7F3D0\" strokeWidth=\"2.5\" />\n            <text x=\"240\" y=\"250\" fill=\"#FFFFFF\" fontSize=\"16\" fontWeight=\"bold\">क्लोरोफिल (Chlorophyll)</text>\n          </svg>\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        },
        {
          "id": "photo-2-inputs",
          "type": "SPLIT_EXPLAINER",
          "heading": "क्लोरोप्लास्ट की अद्भुत रसोई",
          "subtext": "पत्तियों में मौजूद क्लोरोफिल सौर ऊर्जा को रासायनिक ऊर्जा में बदलता है।",
          "bulletPoints": [
            "सूर्य का प्रकाश: पत्तियों के क्लोरोफिल द्वारा अवशोषित",
            "जल और खनिज: जड़ों से तने के रास्ते पत्तियों तक",
            "कार्बन डाइऑक्साइड: छोटे रंध्रों से हवा का प्रवेश"
          ],
          "highlightWord": "क्लोरोफिल",
          "iconName": "Sun",
          "narrationScript": "पत्तियों में मौजूद क्लोरोफिल सूर्य की ऊर्जा सोखता है। जड़ें पानी लाती हैं और पत्तियों के रंध्र हवा से कार्बन डाइऑक्साइड ग्रहण करते हैं।",
          "accentColor": "#2DD4BF",
          "durationInFrames": 353,
          "durationInSeconds": 11.256,
          "audioUrl": "/demos/photosynthesis-hi/scene-2.mp3",
          "captions": [
            {
              "text": "पत्तियों",
              "startMs": 100,
              "endMs": 688
            },
            {
              "text": "में",
              "startMs": 700,
              "endMs": 850
            },
            {
              "text": "मौजूद",
              "startMs": 863,
              "endMs": 1413
            },
            {
              "text": "क्लोरोफिल",
              "startMs": 1425,
              "endMs": 2013
            },
            {
              "text": "सूर्य",
              "startMs": 2025,
              "endMs": 2413
            },
            {
              "text": "की",
              "startMs": 2425,
              "endMs": 2613
            },
            {
              "text": "ऊर्जा",
              "startMs": 2625,
              "endMs": 3013
            },
            {
              "text": "सोखता",
              "startMs": 3025,
              "endMs": 3463
            },
            {
              "text": "है",
              "startMs": 3475,
              "endMs": 3750
            },
            {
              "text": "जड़ें",
              "startMs": 4625,
              "endMs": 5075
            },
            {
              "text": "पानी",
              "startMs": 5088,
              "endMs": 5450
            },
            {
              "text": "लाती",
              "startMs": 5463,
              "endMs": 5825
            },
            {
              "text": "हैं",
              "startMs": 5838,
              "endMs": 6275
            },
            {
              "text": "और",
              "startMs": 6288,
              "endMs": 6575
            },
            {
              "text": "पत्तियों",
              "startMs": 6588,
              "endMs": 7088
            },
            {
              "text": "के",
              "startMs": 7100,
              "endMs": 7250
            },
            {
              "text": "रंध्र",
              "startMs": 7263,
              "endMs": 7638
            },
            {
              "text": "हवा",
              "startMs": 7650,
              "endMs": 8000
            },
            {
              "text": "से",
              "startMs": 8013,
              "endMs": 8225
            },
            {
              "text": "कार्बन",
              "startMs": 8238,
              "endMs": 8788
            },
            {
              "text": "डाइऑक्साइड",
              "startMs": 8800,
              "endMs": 9400
            },
            {
              "text": "ग्रहण",
              "startMs": 9413,
              "endMs": 9738
            },
            {
              "text": "करते",
              "startMs": 9750,
              "endMs": 10063
            },
            {
              "text": "हैं",
              "startMs": 10075,
              "endMs": 10375
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const intro = Remotion.spring({ frame, fps, config: { damping: 14 } });\n    const components = [\n      { title: \"सूर्य का प्रकाश\", desc: \"ऊर्जा का मुख्य स्रोत\", color: \"#FDE047\" },\n      { title: \"जल (H2O)\", desc: \"जड़ों से अवशोषित\", color: \"#38BDF8\" },\n      { title: \"कार्बन डाइऑक्साइड (CO2)\", desc: \"पत्तियों के रंध्रों द्वारा\", color: \"#34D399\" }\n    ];\n    return (\n      <div style={{ display: \"flex\", flexDirection: \"column\", width: \"100%\", height: \"100%\", alignItems: \"center\", justifyContent: \"center\", padding: isPortrait ? \"60px 48px 300px 48px\" : \"60px 80px 180px\", boxSizing: \"border-box\", transform: \"scale(\" + intro + \")\" }}>\n        <h1 style={{ fontSize: isPortrait ? \"36px\" : \"48px\", fontWeight: 800, color: palette.textPrimary, marginBottom: \"28px\", textAlign: \"center\" }}>{heading}</h1>\n        <div style={{ display: \"flex\", flexDirection: isPortrait ? \"column\" : \"row\", gap: \"20px\", width: \"100%\", maxWidth: \"960px\", justifyContent: \"center\" }}>\n          {components.map((c, i) => (\n            <div key={i} style={{ flex: 1, backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"20px\", padding: \"24px\", textAlign: \"center\" }}>\n              <div style={{ width: \"48px\", height: \"48px\", borderRadius: \"50%\", backgroundColor: c.color + \"22\", border: \"1px solid \" + c.color, margin: \"0 auto 16px\", display: \"flex\", alignItems: \"center\", justifyContent: \"center\", fontSize: \"20px\", fontWeight: \"bold\", color: c.color }}>{i + 1}</div>\n              <h3 style={{ fontSize: \"22px\", fontWeight: 700, color: palette.textPrimary, margin: \"0 0 8px\" }}>{c.title}</h3>\n              <p style={{ fontSize: \"16px\", color: palette.textSecondary, margin: 0 }}>{c.desc}</p>\n            </div>\n          ))}\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        },
        {
          "id": "photo-3-metric",
          "type": "KEY_METRIC_OR_FACT",
          "heading": "पृथ्वी की ऑक्सीजन का मुख्य स्रोत",
          "subtext": "प्रकाश संश्लेषण से वायुमंडल की अधिकांश ऑक्सीजन और जैविक ऊर्जा उत्पन्न होती है।",
          "highlightWord": "70%",
          "iconName": "Sprout",
          "narrationScript": "पृथ्वी के वायुमंडल की लगभग सत्तर प्रतिशत ऑक्सीजन महासागरों और पौधों के प्रकाश संश्लेषण से ही प्राप्त होती है।",
          "accentColor": "#34D399",
          "durationInFrames": 290,
          "durationInSeconds": 9.144,
          "audioUrl": "/demos/photosynthesis-hi/scene-3.mp3",
          "captions": [
            {
              "text": "पृथ्वी",
              "startMs": 100,
              "endMs": 688
            },
            {
              "text": "के",
              "startMs": 700,
              "endMs": 863
            },
            {
              "text": "वायुमंडल",
              "startMs": 875,
              "endMs": 1563
            },
            {
              "text": "की",
              "startMs": 1575,
              "endMs": 1725
            },
            {
              "text": "लगभग",
              "startMs": 1738,
              "endMs": 2175
            },
            {
              "text": "सत्तर",
              "startMs": 2188,
              "endMs": 2613
            },
            {
              "text": "प्रतिशत",
              "startMs": 2625,
              "endMs": 3175
            },
            {
              "text": "ऑक्सीजन",
              "startMs": 3188,
              "endMs": 3800
            },
            {
              "text": "महासागरों",
              "startMs": 3813,
              "endMs": 4800
            },
            {
              "text": "और",
              "startMs": 4813,
              "endMs": 5063
            },
            {
              "text": "पौधों",
              "startMs": 5075,
              "endMs": 5513
            },
            {
              "text": "के",
              "startMs": 5525,
              "endMs": 5650
            },
            {
              "text": "प्रकाश",
              "startMs": 5663,
              "endMs": 6138
            },
            {
              "text": "संश्लेषण",
              "startMs": 6150,
              "endMs": 6838
            },
            {
              "text": "से",
              "startMs": 6850,
              "endMs": 6975
            },
            {
              "text": "ही",
              "startMs": 6988,
              "endMs": 7250
            },
            {
              "text": "प्राप्त",
              "startMs": 7263,
              "endMs": 7663
            },
            {
              "text": "होती",
              "startMs": 7675,
              "endMs": 8000
            },
            {
              "text": "है",
              "startMs": 8013,
              "endMs": 8263
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const intro = Remotion.spring({ frame, fps, config: { damping: 14 } });\n    const padB = isPortrait ? \"320px\" : \"210px\";\n    return (\n      <div style={{ display: \"flex\", flexDirection: \"column\", width: \"100%\", height: \"100%\", alignItems: \"center\", justifyContent: \"center\", padding: isPortrait ? `60px 48px ${padB} 48px` : `60px 80px ${padB}`, boxSizing: \"border-box\", transform: \"scale(\" + intro + \")\", fontFamily: \"Inter, system-ui, sans-serif\" }}>\n        <div style={{ backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"28px\", padding: isPortrait ? \"32px 20px\" : \"48px 60px\", maxWidth: \"900px\", width: \"100%\", textAlign: \"center\", boxShadow: \"0 12px 32px rgba(0,0,0,0.5)\" }}>\n          <div style={{ fontSize: \"18px\", color: accentColor, fontWeight: 700, marginBottom: \"12px\" }}>संतुलित रासायनिक अभिक्रिया</div>\n          <h1 style={{ fontSize: isPortrait ? \"32px\" : \"44px\", fontWeight: 800, color: palette.textPrimary, margin: \"0 0 24px\" }}>6CO₂ + 6H₂O + प्रकाश → C₆H₁₂O₆ + 6O₂</h1>\n          <div style={{ display: \"flex\", justifyContent: \"center\", gap: \"24px\" }}>\n            <div style={{ backgroundColor: \"#021B15\", borderRadius: \"14px\", padding: \"14px 20px\", border: \"1px solid rgba(52,211,153,0.3)\" }}>\n              <div style={{ fontSize: \"14px\", color: palette.textSecondary }}>उत्पाद (Product)</div>\n              <div style={{ fontSize: \"22px\", fontWeight: 700, color: \"#34D399\" }}>ग्लूकोज (ऊर्जा)</div>\n            </div>\n            <div style={{ backgroundColor: \"#021B15\", borderRadius: \"14px\", padding: \"14px 20px\", border: \"1px solid rgba(52,211,153,0.3)\" }}>\n              <div style={{ fontSize: \"14px\", color: palette.textSecondary }}>उप-उत्पाद (Byproduct)</div>\n              <div style={{ fontSize: \"22px\", fontWeight: 700, color: \"#38BDF8\" }}>ऑक्सीजन (प्राणवायु)</div>\n            </div>\n          </div>\n          <p style={{ fontSize: isPortrait ? \"18px\" : \"20px\", color: palette.textSecondary, marginTop: \"24px\", marginBottom: 0 }}>{subtext}</p>\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        },
        {
          "id": "photo-4-summary",
          "type": "SUMMARY_TAKEAWAY",
          "heading": "मुख्य निष्कर्ष: प्रकृति का संतुलन",
          "subtext": "हर पत्ती पृथ्वी पर जीवन और स्वच्छ वायु का आधार बनाती है।",
          "bulletPoints": [
            "सौर ऊर्जा से ग्लूकोज और जीवनदायी ऑक्सीजन का निर्माण",
            "वायुमंडल से कार्बन डाइऑक्साइड कम करने में सहायक",
            "खाद्य श्रृंखला के हर जीव के लिए ऊर्जा का मूल स्रोत"
          ],
          "highlightWord": "मुख्य बिंदु",
          "iconName": "CheckCircle2",
          "narrationScript": "संक्षेप में, प्रकाश संश्लेषण सौर ऊर्जा को भोजन में बदलता है, ऑक्सीजन मुक्त करता है, और पृथ्वी पर जीवन का संतुलन बनाए रखता है।",
          "accentColor": "#10B981",
          "durationInFrames": 351,
          "durationInSeconds": 11.184,
          "audioUrl": "/demos/photosynthesis-hi/scene-4.mp3",
          "captions": [
            {
              "text": "संक्षेप",
              "startMs": 100,
              "endMs": 838
            },
            {
              "text": "में",
              "startMs": 850,
              "endMs": 1175
            },
            {
              "text": "प्रकाश",
              "startMs": 1375,
              "endMs": 1938
            },
            {
              "text": "संश्लेषण",
              "startMs": 1950,
              "endMs": 2663
            },
            {
              "text": "सौर",
              "startMs": 2675,
              "endMs": 3050
            },
            {
              "text": "ऊर्जा",
              "startMs": 3063,
              "endMs": 3463
            },
            {
              "text": "को",
              "startMs": 3475,
              "endMs": 3650
            },
            {
              "text": "भोजन",
              "startMs": 3663,
              "endMs": 4063
            },
            {
              "text": "में",
              "startMs": 4075,
              "endMs": 4213
            },
            {
              "text": "बदलता",
              "startMs": 4225,
              "endMs": 4663
            },
            {
              "text": "है",
              "startMs": 4675,
              "endMs": 4963
            },
            {
              "text": "ऑक्सीजन",
              "startMs": 5250,
              "endMs": 5888
            },
            {
              "text": "मुक्त",
              "startMs": 5900,
              "endMs": 6200
            },
            {
              "text": "करता",
              "startMs": 6213,
              "endMs": 6550
            },
            {
              "text": "है",
              "startMs": 6563,
              "endMs": 6850
            },
            {
              "text": "और",
              "startMs": 7088,
              "endMs": 7350
            },
            {
              "text": "पृथ्वी",
              "startMs": 7363,
              "endMs": 7838
            },
            {
              "text": "पर",
              "startMs": 7850,
              "endMs": 8075
            },
            {
              "text": "जीवन",
              "startMs": 8088,
              "endMs": 8500
            },
            {
              "text": "का",
              "startMs": 8513,
              "endMs": 8663
            },
            {
              "text": "संतुलन",
              "startMs": 8675,
              "endMs": 9263
            },
            {
              "text": "बनाए",
              "startMs": 9275,
              "endMs": 9625
            },
            {
              "text": "रखता",
              "startMs": 9638,
              "endMs": 10000
            },
            {
              "text": "है",
              "startMs": 10013,
              "endMs": 10300
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const bullets = [\n      \"पौधे सूर्य के प्रकाश को रासायनिक ऊर्जा में बदलते हैं\",\n      \"पृथ्वी के सभी जीवों के लिए ऑक्सीजन का निर्माण होता है\",\n      \"वायुमंडल में कार्बन डाइऑक्साइड का प्राकृतिक संतुलन रहता है\"\n    ];\n    return (\n      <div style={{ display: \"flex\", flexDirection: \"column\", width: \"100%\", height: \"100%\", alignItems: \"center\", justifyContent: \"center\", padding: isPortrait ? \"60px 48px 300px 48px\" : \"60px 80px 180px\", boxSizing: \"border-box\" }}>\n        <h1 style={{ fontSize: isPortrait ? \"34px\" : \"48px\", fontWeight: 800, color: palette.textPrimary, marginBottom: \"32px\", textAlign: \"center\" }}>{heading}</h1>\n        <div style={{ display: \"flex\", flexDirection: \"column\", gap: \"16px\", width: \"100%\", maxWidth: \"800px\" }}>\n          {bullets.map((b, i) => (\n            <div key={i} style={{ backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"16px\", padding: \"18px 24px\", display: \"flex\", alignItems: \"center\", gap: \"16px\" }}>\n              <div style={{ width: \"32px\", height: \"32px\", borderRadius: \"50%\", backgroundColor: accentColor + \"22\", display: \"flex\", alignItems: \"center\", justifyContent: \"center\", color: accentColor, fontWeight: \"bold\" }}>✓</div>\n              <p style={{ fontSize: isPortrait ? \"18px\" : \"20px\", color: palette.textPrimary, margin: 0 }}>{b}</p>\n            </div>\n          ))}\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        }
      ],
      "totalDurationInFrames": 1338
    }
  },
  {
    "id": "rocket-engines",
    "label": "How Rocket Engines Work",
    "badge": "Aerospace Physics",
    "languageLabel": "English (IN)",
    "project": {
      "id": "showcase-rocket-engines",
      "topic": "How Rocket Engines Work",
      "language": "en-IN",
      "theme": "sunset_amber",
      "aspectRatio": "16:9",
      "fps": 30,
      "scenes": [
        {
          "id": "rocket-1-hero",
          "type": "TITLE_HERO",
          "heading": "How Rocket Engines Defy Gravity",
          "subtext": "Newton's third law turns intense chemical combustion into orbital thrust.",
          "highlightWord": "PROPULSION",
          "iconName": "Rocket",
          "narrationScript": "How do massive rockets escape Earth's gravity? The secret lies in controlled combustion and Newton's third law of motion.",
          "accentColor": "#F59E0B",
          "durationInFrames": 285,
          "durationInSeconds": 9,
          "audioUrl": "/demos/rocket-engines/scene-1.mp3",
          "captions": [
            {
              "text": "How",
              "startMs": 100,
              "endMs": 413
            },
            {
              "text": "do",
              "startMs": 425,
              "endMs": 588
            },
            {
              "text": "massive",
              "startMs": 600,
              "endMs": 1050
            },
            {
              "text": "rockets",
              "startMs": 1063,
              "endMs": 1538
            },
            {
              "text": "escape",
              "startMs": 1550,
              "endMs": 2025
            },
            {
              "text": "Earth's",
              "startMs": 2038,
              "endMs": 2325
            },
            {
              "text": "gravity",
              "startMs": 2338,
              "endMs": 2950
            },
            {
              "text": "The",
              "startMs": 3813,
              "endMs": 4013
            },
            {
              "text": "secret",
              "startMs": 4025,
              "endMs": 4513
            },
            {
              "text": "lies",
              "startMs": 4525,
              "endMs": 4850
            },
            {
              "text": "in",
              "startMs": 4863,
              "endMs": 4975
            },
            {
              "text": "controlled",
              "startMs": 4988,
              "endMs": 5500
            },
            {
              "text": "combustion",
              "startMs": 5513,
              "endMs": 6188
            },
            {
              "text": "and",
              "startMs": 6200,
              "endMs": 6425
            },
            {
              "text": "Newton's",
              "startMs": 6438,
              "endMs": 6875
            },
            {
              "text": "third",
              "startMs": 6888,
              "endMs": 7200
            },
            {
              "text": "law",
              "startMs": 7213,
              "endMs": 7413
            },
            {
              "text": "of",
              "startMs": 7425,
              "endMs": 7588
            },
            {
              "text": "motion",
              "startMs": 7600,
              "endMs": 8125
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const intro = Remotion.spring({ frame, fps, config: { damping: 14 } });\n    const flameY = (frame % 10) * 3;\n    return (\n      <div style={{ display: \"flex\", flexDirection: isPortrait ? \"column\" : \"row\", width: \"100%\", height: \"100%\", alignItems: \"center\", justifyContent: \"space-between\", padding: isPortrait ? \"60px 48px 300px 48px\" : \"60px 80px 180px\", boxSizing: \"border-box\" }}>\n        <div style={{ flex: 1, maxWidth: isPortrait ? \"100%\" : \"48%\" }}>\n          <div style={{ display: \"inline-flex\", alignItems: \"center\", gap: \"8px\", padding: \"6px 14px\", borderRadius: \"999px\", backgroundColor: accentColor + \"22\", border: \"1px solid \" + accentColor + \"66\", color: accentColor, fontSize: \"16px\", fontWeight: 700, marginBottom: \"16px\" }}>\n            <Lucide.Rocket size={18} color={accentColor} />\n            <span>AEROSPACE PHYSICS</span>\n          </div>\n          <h1 style={{ fontSize: isPortrait ? \"38px\" : \"54px\", fontWeight: 800, color: palette.textPrimary, margin: \"0 0 16px 0\", lineHeight: 1.15 }}>{heading}</h1>\n          <p style={{ fontSize: isPortrait ? \"20px\" : \"24px\", color: palette.textSecondary, margin: 0, lineHeight: 1.45 }}>{subtext}</p>\n        </div>\n        <div style={{ flex: 1, width: \"100%\", maxWidth: isPortrait ? \"100%\" : \"48%\", maxHeight: isPortrait ? \"1050px\" : \"540px\", flex: 1, backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"24px\", padding: \"20px\", boxSizing: \"border-box\", display: \"flex\", alignItems: \"center\", justifyContent: \"center\", transform: \"scale(\" + intro + \")\" }}>\n          <svg viewBox=\"0 0 400 320\" style={{ width: \"100%\", height: \"100%\" }}>\n            {/* Rocket Body */}\n            <path d=\"M 200 40 Q 240 100 240 180 L 160 180 Q 160 100 200 40 Z\" fill=\"#334155\" stroke=\"#F59E0B\" strokeWidth=\"3\" />\n            {/* Bell Nozzle */}\n            <path d=\"M 175 180 L 150 250 L 250 250 L 225 180 Z\" fill=\"#1E293B\" stroke=\"#F59E0B\" strokeWidth=\"2.5\" />\n            {/* Thrust exhaust plume */}\n            <path d={\"M 160 250 Q 200 \" + (300 + flameY) + \" 240 250 Z\"} fill=\"#EF4444\" opacity=\"0.8\" />\n            <path d={\"M 175 250 Q 200 \" + (285 + flameY) + \" 225 250 Z\"} fill=\"#FDE047\" opacity=\"0.9\" />\n            {/* Upward Thrust Arrow */}\n            <line x1=\"280\" y1=\"140\" x2=\"280\" y2=\"70\" stroke=\"#10B981\" strokeWidth=\"4\" markerEnd=\"url(#arrow)\" />\n            <text x=\"300\" y=\"110\" fill=\"#10B981\" fontSize=\"16\" fontWeight=\"bold\">Thrust ↑</text>\n          </svg>\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        },
        {
          "id": "rocket-2-metric",
          "type": "KEY_METRIC_OR_FACT",
          "heading": "Orbital Velocity Milestone",
          "subtext": "Rockets must accelerate horizontally past 28,000 kilometers per hour to stay in orbit.",
          "highlightWord": "28,000 km/h",
          "iconName": "Gauge",
          "narrationScript": "To reach low Earth orbit, a rocket engine must accelerate its payload beyond twenty eight thousand kilometers per hour.",
          "accentColor": "#FB7185",
          "durationInFrames": 268,
          "durationInSeconds": 8.424,
          "audioUrl": "/demos/rocket-engines/scene-2.mp3",
          "captions": [
            {
              "text": "To",
              "startMs": 100,
              "endMs": 275
            },
            {
              "text": "reach",
              "startMs": 288,
              "endMs": 588
            },
            {
              "text": "low",
              "startMs": 600,
              "endMs": 888
            },
            {
              "text": "Earth",
              "startMs": 900,
              "endMs": 1175
            },
            {
              "text": "orbit",
              "startMs": 1188,
              "endMs": 1713
            },
            {
              "text": "a",
              "startMs": 1850,
              "endMs": 1975
            },
            {
              "text": "rocket",
              "startMs": 1988,
              "endMs": 2500
            },
            {
              "text": "engine",
              "startMs": 2513,
              "endMs": 2875
            },
            {
              "text": "must",
              "startMs": 2888,
              "endMs": 3213
            },
            {
              "text": "accelerate",
              "startMs": 3225,
              "endMs": 3875
            },
            {
              "text": "its",
              "startMs": 3888,
              "endMs": 4088
            },
            {
              "text": "payload",
              "startMs": 4100,
              "endMs": 4588
            },
            {
              "text": "beyond",
              "startMs": 4600,
              "endMs": 4988
            },
            {
              "text": "twenty",
              "startMs": 5000,
              "endMs": 5450
            },
            {
              "text": "eight",
              "startMs": 5463,
              "endMs": 5713
            },
            {
              "text": "thousand",
              "startMs": 5725,
              "endMs": 6188
            },
            {
              "text": "kilometers",
              "startMs": 6200,
              "endMs": 6913
            },
            {
              "text": "per",
              "startMs": 6925,
              "endMs": 7225
            },
            {
              "text": "hour",
              "startMs": 7238,
              "endMs": 7563
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const intro = Remotion.spring({ frame, fps, config: { damping: 14 } });\n    return (\n      <div style={{ display: \"flex\", flexDirection: isPortrait ? \"column\" : \"row\", width: \"100%\", height: \"100%\", alignItems: \"center\", justifyContent: \"space-between\", padding: isPortrait ? \"60px 48px 300px 48px\" : \"60px 80px 180px\", boxSizing: \"border-box\" }}>\n        <div style={{ flex: 1, maxWidth: isPortrait ? \"100%\" : \"48%\" }}>\n          <h1 style={{ fontSize: isPortrait ? \"36px\" : \"48px\", fontWeight: 800, color: palette.textPrimary, margin: \"0 0 16px 0\", lineHeight: 1.15 }}>{heading}</h1>\n          <p style={{ fontSize: isPortrait ? \"20px\" : \"24px\", color: palette.textSecondary, margin: \"0 0 24px 0\", lineHeight: 1.45 }}>{subtext}</p>\n          <div style={{ display: \"flex\", flexDirection: \"column\", gap: \"10px\" }}>\n            <div style={{ padding: \"10px 16px\", borderRadius: \"10px\", backgroundColor: \"rgba(249, 115, 22, 0.15)\", border: \"1px solid #F97316\", color: \"#F97316\", fontSize: \"16px\", fontWeight: 600 }}>1. High Pressure Propellant Injection</div>\n            <div style={{ padding: \"10px 16px\", borderRadius: \"10px\", backgroundColor: \"rgba(239, 68, 68, 0.15)\", border: \"1px solid #EF4444\", color: \"#EF4444\", fontSize: \"16px\", fontWeight: 600 }}>2. Exothermic Chemical Combustion</div>\n            <div style={{ padding: \"10px 16px\", borderRadius: \"10px\", backgroundColor: \"rgba(245, 158, 11, 0.15)\", border: \"1px solid #F59E0B\", color: \"#F59E0B\", fontSize: \"16px\", fontWeight: 600 }}>3. Convergent-Divergent Nozzle Acceleration</div>\n          </div>\n        </div>\n        <div style={{ flex: 1, width: \"100%\", maxWidth: isPortrait ? \"100%\" : \"48%\", maxHeight: isPortrait ? \"1050px\" : \"540px\", flex: 1, backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"24px\", padding: \"24px\", boxSizing: \"border-box\", display: \"flex\", alignItems: \"center\", justifyContent: \"center\", transform: \"scale(\" + intro + \")\" }}>\n          <svg viewBox={isPortrait ? \"0 0 600 750\" : \"0 0 700 380\"} style={{ width: \"100%\", height: \"100%\" }}>\n            {/* Chamber */}\n            <rect x=\"120\" y=\"50\" width=\"160\" height=\"90\" rx=\"10\" fill=\"#1E293B\" stroke=\"#F59E0B\" strokeWidth=\"3\" />\n            <text x=\"200\" y=\"105\" fill=\"#EF4444\" fontSize=\"16\" fontWeight=\"bold\" textAnchor=\"middle\">3,000°C Combustion</text>\n            {/* Nozzle throat */}\n            <path d=\"M 150 140 Q 180 180 120 250 L 280 250 Q 220 180 250 140 Z\" fill=\"#0F172A\" stroke=\"#F59E0B\" strokeWidth=\"3\" />\n            <text x=\"200\" y=\"210\" fill=\"#FDE047\" fontSize=\"15\" fontWeight=\"bold\" textAnchor=\"middle\">Mach &gt; 3 Expansion</text>\n          </svg>\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        },
        {
          "id": "rocket-3-flow",
          "type": "STEP_BY_STEP_FLOW",
          "heading": "Inside the Rocket Propulsion Cycle",
          "subtext": "Three high-pressure stages convert stored propellant into forward thrust.",
          "bulletPoints": [
            "Mix: Fuel and liquid oxidizer enter the combustion chamber",
            "Ignite: Superheated gas expands at extreme pressure",
            "Accelerate: Bell nozzle exhausts gas for equal opposite thrust"
          ],
          "highlightWord": "THRUST CYCLE",
          "iconName": "Flame",
          "narrationScript": "First, fuel and oxidizer mix inside the chamber. Next, intense combustion creates high-pressure gas, which blasts through the bell nozzle to push the rocket upward.",
          "accentColor": "#F59E0B",
          "durationInFrames": 391,
          "durationInSeconds": 12.504,
          "audioUrl": "/demos/rocket-engines/scene-3.mp3",
          "captions": [
            {
              "text": "First",
              "startMs": 100,
              "endMs": 688
            },
            {
              "text": "fuel",
              "startMs": 825,
              "endMs": 1275
            },
            {
              "text": "and",
              "startMs": 1288,
              "endMs": 1438
            },
            {
              "text": "oxidizer",
              "startMs": 1450,
              "endMs": 2200
            },
            {
              "text": "mix",
              "startMs": 2213,
              "endMs": 2500
            },
            {
              "text": "inside",
              "startMs": 2513,
              "endMs": 2988
            },
            {
              "text": "the",
              "startMs": 3000,
              "endMs": 3088
            },
            {
              "text": "chamber",
              "startMs": 3100,
              "endMs": 3650
            },
            {
              "text": "Next",
              "startMs": 4525,
              "endMs": 5113
            },
            {
              "text": "intense",
              "startMs": 5238,
              "endMs": 5775
            },
            {
              "text": "combustion",
              "startMs": 5788,
              "endMs": 6400
            },
            {
              "text": "creates",
              "startMs": 6413,
              "endMs": 6900
            },
            {
              "text": "high-pressure",
              "startMs": 6913,
              "endMs": 7563
            },
            {
              "text": "gas",
              "startMs": 7575,
              "endMs": 8025
            },
            {
              "text": "which",
              "startMs": 8288,
              "endMs": 8500
            },
            {
              "text": "blasts",
              "startMs": 8513,
              "endMs": 9013
            },
            {
              "text": "through",
              "startMs": 9025,
              "endMs": 9213
            },
            {
              "text": "the",
              "startMs": 9225,
              "endMs": 9325
            },
            {
              "text": "bell",
              "startMs": 9338,
              "endMs": 9625
            },
            {
              "text": "nozzle",
              "startMs": 9638,
              "endMs": 10038
            },
            {
              "text": "to",
              "startMs": 10050,
              "endMs": 10175
            },
            {
              "text": "push",
              "startMs": 10188,
              "endMs": 10513
            },
            {
              "text": "the",
              "startMs": 10525,
              "endMs": 10650
            },
            {
              "text": "rocket",
              "startMs": 10663,
              "endMs": 11100
            },
            {
              "text": "upward",
              "startMs": 11113,
              "endMs": 11638
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const intro = Remotion.spring({ frame, fps, config: { damping: 14 } });\n    const padB = isPortrait ? \"320px\" : \"210px\";\n    return (\n      <div style={{ display: \"flex\", flexDirection: \"column\", width: \"100%\", height: \"100%\", alignItems: \"center\", justifyContent: \"center\", padding: isPortrait ? `60px 48px ${padB} 48px` : `60px 80px ${padB}`, boxSizing: \"border-box\", transform: \"scale(\" + intro + \")\", fontFamily: \"Inter, system-ui, sans-serif\" }}>\n        <div style={{ backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"28px\", padding: isPortrait ? \"36px 20px\" : \"48px 64px\", maxWidth: \"800px\", width: \"100%\", textAlign: \"center\", boxShadow: \"0 12px 32px rgba(0,0,0,0.5)\" }}>\n          <div style={{ fontSize: \"20px\", color: accentColor, fontWeight: 700, marginBottom: \"12px\" }}>EFFICIENCY METRIC</div>\n          <h1 style={{ fontSize: isPortrait ? \"48px\" : \"68px\", fontWeight: 900, color: palette.textPrimary, margin: \"0 0 20px\" }}>Isp = 450s</h1>\n          <p style={{ fontSize: \"20px\", color: palette.textSecondary, margin: \"0 0 24px\" }}>Liquid Hydrogen + Liquid Oxygen vacuum specific impulse</p>\n          <div style={{ display: \"flex\", justifyContent: \"center\", gap: \"24px\" }}>\n            <div style={{ backgroundColor: \"#090D16\", borderRadius: \"14px\", padding: \"14px 24px\", border: \"1px solid rgba(255,255,255,0.15)\" }}>\n              <div style={{ fontSize: \"14px\", color: palette.textSecondary }}>Exhaust Velocity</div>\n              <div style={{ fontSize: \"26px\", fontWeight: 800, color: \"#F59E0B\" }}>4,400 m/s</div>\n            </div>\n            <div style={{ backgroundColor: \"#090D16\", borderRadius: \"14px\", padding: \"14px 24px\", border: \"1px solid rgba(255,255,255,0.15)\" }}>\n              <div style={{ fontSize: \"14px\", color: palette.textSecondary }}>Orbital Speed</div>\n              <div style={{ fontSize: \"26px\", fontWeight: 800, color: \"#38BDF8\" }}>7.8 km/s</div>\n            </div>\n          </div>\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        },
        {
          "id": "rocket-4-summary",
          "type": "SUMMARY_TAKEAWAY",
          "heading": "Rocket Propulsion Key Takeaways",
          "subtext": "Carrying its own oxidizer lets a rocket fire even in the vacuum of space.",
          "bulletPoints": [
            "Onboard oxidizer enables thrust without atmospheric air",
            "Bell nozzle converts thermal pressure into exhaust velocity",
            "Multi-stage rockets shed empty tanks to reach orbit"
          ],
          "highlightWord": "ORBIT READY",
          "iconName": "Orbit",
          "narrationScript": "Remember: rockets carry their own oxidizer to burn in space, shape exhaust through a bell nozzle, and drop empty stages to reach orbit.",
          "accentColor": "#34D399",
          "durationInFrames": 324,
          "durationInSeconds": 10.296,
          "audioUrl": "/demos/rocket-engines/scene-4.mp3",
          "captions": [
            {
              "text": "Remember",
              "startMs": 100,
              "endMs": 850
            },
            {
              "text": "rockets",
              "startMs": 1038,
              "endMs": 1575
            },
            {
              "text": "carry",
              "startMs": 1588,
              "endMs": 1950
            },
            {
              "text": "their",
              "startMs": 1963,
              "endMs": 2200
            },
            {
              "text": "own",
              "startMs": 2213,
              "endMs": 2450
            },
            {
              "text": "oxidizer",
              "startMs": 2463,
              "endMs": 3200
            },
            {
              "text": "to",
              "startMs": 3213,
              "endMs": 3388
            },
            {
              "text": "burn",
              "startMs": 3400,
              "endMs": 3725
            },
            {
              "text": "in",
              "startMs": 3738,
              "endMs": 3875
            },
            {
              "text": "space",
              "startMs": 3888,
              "endMs": 4375
            },
            {
              "text": "shape",
              "startMs": 4550,
              "endMs": 4975
            },
            {
              "text": "exhaust",
              "startMs": 4988,
              "endMs": 5538
            },
            {
              "text": "through",
              "startMs": 5550,
              "endMs": 5750
            },
            {
              "text": "a",
              "startMs": 5763,
              "endMs": 5825
            },
            {
              "text": "bell",
              "startMs": 5838,
              "endMs": 6138
            },
            {
              "text": "nozzle",
              "startMs": 6150,
              "endMs": 6638
            },
            {
              "text": "and",
              "startMs": 6800,
              "endMs": 7063
            },
            {
              "text": "drop",
              "startMs": 7075,
              "endMs": 7450
            },
            {
              "text": "empty",
              "startMs": 7463,
              "endMs": 7838
            },
            {
              "text": "stages",
              "startMs": 7850,
              "endMs": 8388
            },
            {
              "text": "to",
              "startMs": 8400,
              "endMs": 8538
            },
            {
              "text": "reach",
              "startMs": 8550,
              "endMs": 8875
            },
            {
              "text": "orbit",
              "startMs": 8888,
              "endMs": 9425
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const steps = [\n      { name: \"Stage 1 Liftoff\", desc: \"Heavy sea-level boosters overcome Earth gravity\" },\n      { name: \"Stage Separation\", desc: \"Jettisons empty propellant mass for acceleration\" },\n      { name: \"Upper Stage Burn\", desc: \"Vacuum optimized nozzle accelerates into orbit\" }\n    ];\n    return (\n      <div style={{ display: \"flex\", flexDirection: \"column\", width: \"100%\", height: \"100%\", alignItems: \"center\", justifyContent: \"center\", padding: isPortrait ? \"60px 48px 300px 48px\" : \"60px 80px 180px\", boxSizing: \"border-box\" }}>\n        <h1 style={{ fontSize: isPortrait ? \"36px\" : \"48px\", fontWeight: 800, color: palette.textPrimary, marginBottom: \"32px\", textAlign: \"center\" }}>{heading}</h1>\n        <div style={{ display: \"flex\", flexDirection: isPortrait ? \"column\" : \"row\", gap: \"20px\", width: \"100%\", maxWidth: \"960px\" }}>\n          {steps.map((st, i) => (\n            <div key={i} style={{ flex: 1, backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"20px\", padding: \"24px\" }}>\n              <div style={{ width: \"40px\", height: \"40px\", borderRadius: \"50%\", backgroundColor: accentColor, color: \"#FFFFFF\", fontWeight: \"bold\", display: \"flex\", alignItems: \"center\", justifyContent: \"center\", marginBottom: \"14px\" }}>{i + 1}</div>\n              <h3 style={{ fontSize: \"20px\", fontWeight: 700, color: palette.textPrimary, margin: \"0 0 8px\" }}>{st.name}</h3>\n              <p style={{ fontSize: \"16px\", color: palette.textSecondary, margin: 0 }}>{st.desc}</p>\n            </div>\n          ))}\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        }
      ],
      "totalDurationInFrames": 1268
    }
  },
  {
    "id": "ohms-law-gu",
    "label": "ઓહ્મનો નિયમ",
    "badge": "ભૌતિક વિજ્ઞાન",
    "languageLabel": "ગુજરાતી (Gujarati)",
    "project": {
      "id": "showcase-ohms-law-gu",
      "topic": "ઓહ્મનો નિયમ (Ohm's Law)",
      "language": "gu-IN",
      "theme": "clean_modern",
      "aspectRatio": "16:9",
      "fps": 30,
      "scenes": [
        {
          "id": "ohm-1-hero",
          "type": "TITLE_HERO",
          "heading": "ઓહ્મનો નિયમ: વીજળીનું મૂળભૂત સૂત્ર",
          "subtext": "કોઈ પણ ઇલેક્ટ્રિક સર્કિટમાં વોલ્ટેજ, પ્રવાહ અને અવરોધ વચ્ચેનો સીધો સંબંધ.",
          "highlightWord": "વિદ્યુત શાસ્ત્ર",
          "iconName": "Zap",
          "narrationScript": "નમસ્તે! આજે આપણે ઓહ્મનો નિયમ શીખીશું, જે કોઈ પણ ઇલેક્ટ્રિક સર્કિટમાં વોલ્ટેજ, વિદ્યુત પ્રવાહ અને અવરોધ વચ્ચેનો સંબંધ સમજાવે છે.",
          "accentColor": "#2563EB",
          "durationInFrames": 493,
          "durationInSeconds": 15.912,
          "audioUrl": "/demos/ohms-law-gu/scene-1.mp3",
          "captions": [
            {
              "text": "નમસ્તે",
              "startMs": 100,
              "endMs": 775
            },
            {
              "text": "આજે",
              "startMs": 1663,
              "endMs": 2088
            },
            {
              "text": "આપણે",
              "startMs": 2100,
              "endMs": 2563
            },
            {
              "text": "ઓહ્મનો",
              "startMs": 2600,
              "endMs": 3125
            },
            {
              "text": "નિયમ",
              "startMs": 3163,
              "endMs": 3500
            },
            {
              "text": "શીખીશું",
              "startMs": 3500,
              "endMs": 4138
            },
            {
              "text": "જે",
              "startMs": 4550,
              "endMs": 4750
            },
            {
              "text": "કોઈ",
              "startMs": 4850,
              "endMs": 5050
            },
            {
              "text": "પણ",
              "startMs": 5125,
              "endMs": 5288
            },
            {
              "text": "ઇલેક્ટ્રિક",
              "startMs": 5313,
              "endMs": 5900
            },
            {
              "text": "સર્કિટમાં",
              "startMs": 5913,
              "endMs": 6613
            },
            {
              "text": "વોલ્ટેજ",
              "startMs": 6638,
              "endMs": 7263
            },
            {
              "text": "વિદ્યુત",
              "startMs": 7513,
              "endMs": 7950
            },
            {
              "text": "પ્રવાહ",
              "startMs": 8050,
              "endMs": 8450
            },
            {
              "text": "અને",
              "startMs": 8488,
              "endMs": 8775
            },
            {
              "text": "અવરોધ",
              "startMs": 8888,
              "endMs": 9325
            },
            {
              "text": "વચ્ચેનો",
              "startMs": 9375,
              "endMs": 9950
            },
            {
              "text": "સંબંધ",
              "startMs": 9963,
              "endMs": 10538
            },
            {
              "text": "સમજાવે",
              "startMs": 10575,
              "endMs": 11163
            },
            {
              "text": "છે",
              "startMs": 11213,
              "endMs": 11513
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const intro = Remotion.spring({ frame, fps, config: { damping: 14 } });\n    const electron = (frame % 30) / 30;\n    return (\n      <div style={{ display: \"flex\", flexDirection: isPortrait ? \"column\" : \"row\", width: \"100%\", height: \"100%\", alignItems: \"center\", justifyContent: \"space-between\", padding: isPortrait ? \"60px 48px 300px 48px\" : \"60px 80px 180px\", boxSizing: \"border-box\" }}>\n        <div style={{ flex: 1, maxWidth: isPortrait ? \"100%\" : \"48%\" }}>\n          <div style={{ display: \"inline-flex\", alignItems: \"center\", gap: \"8px\", padding: \"6px 14px\", borderRadius: \"999px\", backgroundColor: accentColor + \"22\", border: \"1px solid \" + accentColor + \"66\", color: accentColor, fontSize: \"16px\", fontWeight: 700, marginBottom: \"16px\" }}>\n            <Lucide.Zap size={18} color={accentColor} />\n            <span>ભૌતિક વિજ્ઞાન</span>\n          </div>\n          <h1 style={{ fontSize: isPortrait ? \"36px\" : \"50px\", fontWeight: 800, color: palette.textPrimary, margin: \"0 0 16px 0\", lineHeight: 1.2 }}>{heading}</h1>\n          <p style={{ fontSize: isPortrait ? \"20px\" : \"24px\", color: palette.textSecondary, margin: 0, lineHeight: 1.5 }}>{subtext}</p>\n        </div>\n        <div style={{ flex: 1, width: \"100%\", maxWidth: isPortrait ? \"100%\" : \"48%\", maxHeight: isPortrait ? \"1050px\" : \"540px\", flex: 1, backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"24px\", padding: \"20px\", boxSizing: \"border-box\", display: \"flex\", alignItems: \"center\", justifyContent: \"center\", transform: \"scale(\" + intro + \")\" }}>\n          <svg viewBox={isPortrait ? \"0 0 600 750\" : \"0 0 700 380\"} style={{ width: \"100%\", height: \"100%\" }}>\n            {/* Circuit loop */}\n            <rect x=\"60\" y=\"50\" width=\"280\" height=\"200\" rx=\"16\" fill=\"none\" stroke=\"#2563EB\" strokeWidth=\"4\" />\n            {/* Battery */}\n            <line x1=\"45\" y1=\"130\" x2=\"75\" y2=\"130\" stroke=\"#EF4444\" strokeWidth=\"6\" />\n            <line x1=\"52\" y1=\"170\" x2=\"68\" y2=\"170\" stroke=\"#3B82F6\" strokeWidth=\"6\" />\n            <text x=\"25\" y=\"155\" fill=\"#EF4444\" fontSize=\"16\" fontWeight=\"bold\">V (+)</text>\n            {/* Resistor */}\n            <path d=\"M 170 50 L 180 35 L 195 65 L 210 35 L 225 65 L 235 50\" fill=\"none\" stroke=\"#F59E0B\" strokeWidth=\"4\" />\n            <text x=\"200\" y=\"25\" fill=\"#F59E0B\" fontSize=\"16\" fontWeight=\"bold\" textAnchor=\"middle\">અવરોધ (R)</text>\n            {/* Flowing current indicator */}\n            <circle cx={60 + electron * 280} cy=\"250\" r=\"6\" fill=\"#FBBF24\" />\n            <text x=\"200\" y=\"280\" fill=\"#2563EB\" fontSize=\"16\" fontWeight=\"bold\" textAnchor=\"middle\">પ્રવાહ I →</text>\n          </svg>\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        },
        {
          "id": "ohm-2-formula",
          "type": "KEY_METRIC_OR_FACT",
          "heading": "ઓહ્મના નિયમનું સુપ્રસિદ્ધ સમીકરણ",
          "subtext": "વોલ્ટેજ (V) બરાબર વિદ્યુત પ્રવાહ (I) ગુણ્યા અવરોધ (R).",
          "highlightWord": "V = I × R",
          "iconName": "Sigma",
          "narrationScript": "ઓહ્મના નિયમ મુજબ, વોલ્ટેજ એ વિદ્યુત પ્રવાહ અને અવરોધના ગુણાકાર બરાબર હોય છે.",
          "accentColor": "#0EA5E9",
          "durationInFrames": 346,
          "durationInSeconds": 11.016,
          "audioUrl": "/demos/ohms-law-gu/scene-2.mp3",
          "captions": [
            {
              "text": "ઓહ્મના",
              "startMs": 100,
              "endMs": 613
            },
            {
              "text": "નિયમ",
              "startMs": 650,
              "endMs": 913
            },
            {
              "text": "મુજબ",
              "startMs": 913,
              "endMs": 1363
            },
            {
              "text": "વોલ્ટેજ",
              "startMs": 1625,
              "endMs": 2225
            },
            {
              "text": "એ",
              "startMs": 2313,
              "endMs": 2463
            },
            {
              "text": "વિદ્યુત",
              "startMs": 2475,
              "endMs": 2925
            },
            {
              "text": "પ્રવાહ",
              "startMs": 3038,
              "endMs": 3425
            },
            {
              "text": "અને",
              "startMs": 3450,
              "endMs": 3750
            },
            {
              "text": "અવરોધના",
              "startMs": 3850,
              "endMs": 4513
            },
            {
              "text": "ગુણાકાર",
              "startMs": 4625,
              "endMs": 5175
            },
            {
              "text": "બરાબર",
              "startMs": 5263,
              "endMs": 5688
            },
            {
              "text": "હોય",
              "startMs": 5713,
              "endMs": 5950
            },
            {
              "text": "છે",
              "startMs": 6013,
              "endMs": 6313
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const intro = Remotion.spring({ frame, fps, config: { damping: 14 } });\n    return (\n      <div style={{ display: \"flex\", flexDirection: \"column\", width: \"100%\", height: \"100%\", alignItems: \"center\", justifyContent: \"center\", padding: isPortrait ? \"60px 48px 300px 48px\" : \"60px 80px 180px\", boxSizing: \"border-box\", transform: \"scale(\" + intro + \")\" }}>\n        <h1 style={{ fontSize: isPortrait ? \"36px\" : \"48px\", fontWeight: 800, color: palette.textPrimary, marginBottom: \"28px\", textAlign: \"center\" }}>{heading}</h1>\n        <div style={{ display: \"flex\", flexDirection: isPortrait ? \"column\" : \"row\", gap: \"20px\", width: \"100%\", maxWidth: \"900px\" }}>\n          <div style={{ flex: 1, backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"20px\", padding: \"24px\", textAlign: \"center\" }}>\n            <div style={{ fontSize: \"32px\", fontWeight: 800, color: \"#2563EB\", marginBottom: \"8px\" }}>V</div>\n            <h3 style={{ fontSize: \"20px\", fontWeight: 700, color: palette.textPrimary, margin: \"0 0 6px\" }}>વોલ્ટેજ</h3>\n            <p style={{ fontSize: \"16px\", color: palette.textSecondary, margin: 0 }}>ઇલેક્ટ્રોનને ધકેલતું દબાણ</p>\n          </div>\n          <div style={{ flex: 1, backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"20px\", padding: \"24px\", textAlign: \"center\" }}>\n            <div style={{ fontSize: \"32px\", fontWeight: 800, color: \"#10B981\", marginBottom: \"8px\" }}>I</div>\n            <h3 style={{ fontSize: \"20px\", fontWeight: 700, color: palette.textPrimary, margin: \"0 0 6px\" }}>પ્રવાહ</h3>\n            <p style={{ fontSize: \"16px\", color: palette.textSecondary, margin: 0 }}>ઇલેક્ટ્રોનનો વહેવાનો દર</p>\n          </div>\n          <div style={{ flex: 1, backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"20px\", padding: \"24px\", textAlign: \"center\" }}>\n            <div style={{ fontSize: \"32px\", fontWeight: 800, color: \"#F59E0B\", marginBottom: \"8px\" }}>R</div>\n            <h3 style={{ fontSize: \"20px\", fontWeight: 700, color: palette.textPrimary, margin: \"0 0 6px\" }}>અવરોધ</h3>\n            <p style={{ fontSize: \"16px\", color: palette.textSecondary, margin: 0 }}>પ્રવાહ સામે થતો વિરોધ</p>\n          </div>\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        },
        {
          "id": "ohm-3-elements",
          "type": "SPLIT_EXPLAINER",
          "heading": "સર્કિટના ત્રણ મુખ્ય ઘટકો",
          "subtext": "દરેક ઘટક ઇલેક્ટ્રોનના પ્રવાહને અલગ રીતે નિયંત્રિત કરે છે.",
          "bulletPoints": [
            "વોલ્ટેજ (V): ઇલેક્ટ્રોનને ધકેલતું વિદ્યુત દબાણ",
            "પ્રવાહ (I): વાયરમાંથી વહેતા વીજભારનો દર",
            "અવરોધ (R): પ્રવાહને રોકતી વાહકની લાક્ષણિકતા"
          ],
          "highlightWord": "V · I · R",
          "iconName": "Cpu",
          "narrationScript": "વોલ્ટેજ ઇલેક્ટ્રોનને આગળ ધકેલે છે, પ્રવાહ તેનો વહેવાનો દર દર્શાવે છે, અને અવરોધ તે પ્રવાહને નિયંત્રિત કરે છે.",
          "accentColor": "#2563EB",
          "durationInFrames": 436,
          "durationInSeconds": 14.016,
          "audioUrl": "/demos/ohms-law-gu/scene-3.mp3",
          "captions": [
            {
              "text": "વોલ્ટેજ",
              "startMs": 100,
              "endMs": 700
            },
            {
              "text": "ઇલેક્ટ્રોનને",
              "startMs": 750,
              "endMs": 1550
            },
            {
              "text": "આગળ",
              "startMs": 1650,
              "endMs": 2038
            },
            {
              "text": "ધકેલે",
              "startMs": 2125,
              "endMs": 2550
            },
            {
              "text": "છે",
              "startMs": 2600,
              "endMs": 2913
            },
            {
              "text": "પ્રવાહ",
              "startMs": 3463,
              "endMs": 3850
            },
            {
              "text": "તેનો",
              "startMs": 3950,
              "endMs": 4238
            },
            {
              "text": "વહેવાનો",
              "startMs": 4250,
              "endMs": 4838
            },
            {
              "text": "દર",
              "startMs": 4988,
              "endMs": 5200
            },
            {
              "text": "દર્શાવે",
              "startMs": 5275,
              "endMs": 5775
            },
            {
              "text": "છે",
              "startMs": 5825,
              "endMs": 6150
            },
            {
              "text": "અને",
              "startMs": 6500,
              "endMs": 6775
            },
            {
              "text": "અવરોધ",
              "startMs": 6863,
              "endMs": 7350
            },
            {
              "text": "તે",
              "startMs": 7463,
              "endMs": 7625
            },
            {
              "text": "પ્રવાહને",
              "startMs": 7725,
              "endMs": 8325
            },
            {
              "text": "નિયંત્રિત",
              "startMs": 8363,
              "endMs": 8938
            },
            {
              "text": "કરે",
              "startMs": 8988,
              "endMs": 9213
            },
            {
              "text": "છે",
              "startMs": 9263,
              "endMs": 9550
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const intro = Remotion.spring({ frame, fps, config: { damping: 14 } });\n    return (\n      <div style={{ display: \"flex\", flexDirection: \"column\", width: \"100%\", height: \"100%\", alignItems: \"center\", justifyContent: \"center\", padding: isPortrait ? \"60px 48px 300px 48px\" : \"60px 80px 180px\", boxSizing: \"border-box\", transform: \"scale(\" + intro + \")\" }}>\n        <div style={{ backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"28px\", padding: isPortrait ? \"36px 20px\" : \"48px 64px\", maxWidth: \"800px\", width: \"100%\", textAlign: \"center\", boxShadow: \"0 12px 32px rgba(0,0,0,0.15)\" }}>\n          <div style={{ fontSize: \"20px\", color: accentColor, fontWeight: 700, marginBottom: \"12px\" }}>ઓહ્મનું ત્રિકોણ સૂત્ર</div>\n          <h1 style={{ fontSize: isPortrait ? \"48px\" : \"68px\", fontWeight: 900, color: palette.textPrimary, margin: \"0 0 24px\" }}>V = I × R</h1>\n          <div style={{ display: \"flex\", justifyContent: \"center\", gap: \"24px\" }}>\n            <div style={{ backgroundColor: \"rgba(37,99,235,0.08)\", borderRadius: \"14px\", padding: \"14px 24px\", border: \"1px solid rgba(37,99,235,0.2)\" }}>\n              <div style={{ fontSize: \"16px\", color: palette.textSecondary }}>પ્રવાહ શોધવા</div>\n              <div style={{ fontSize: \"24px\", fontWeight: 800, color: \"#2563EB\" }}>I = V / R</div>\n            </div>\n            <div style={{ backgroundColor: \"rgba(245,158,11,0.08)\", borderRadius: \"14px\", padding: \"14px 24px\", border: \"1px solid rgba(245,158,11,0.2)\" }}>\n              <div style={{ fontSize: \"16px\", color: palette.textSecondary }}>અવરોધ શોધવા</div>\n              <div style={{ fontSize: \"24px\", fontWeight: 800, color: \"#D97706\" }}>R = V / I</div>\n            </div>\n          </div>\n          <p style={{ fontSize: isPortrait ? \"18px\" : \"20px\", color: palette.textSecondary, marginTop: \"24px\", marginBottom: 0 }}>{subtext}</p>\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        },
        {
          "id": "ohm-4-summary",
          "type": "SUMMARY_TAKEAWAY",
          "heading": "ઓહ્મના નિયમનો સારાંશ",
          "subtext": "સ્માર્ટફોન ચાર્જરથી લઈને પાવર ગ્રીડ સુધી દરેક જગ્યાએ ઉપયોગી.",
          "bulletPoints": [
            "અચળ અવરોધે વોલ્ટેજ વધતાં પ્રવાહ પણ વધે છે",
            "અવરોધ વધારવાથી સર્કિટમાં વિદ્યુત પ્રવાહ ઘટે છે",
            "સુરક્ષિત ઈલેક્ટ્રોનિક ડિઝાઇન માટે અનિવાર્ય નિયમ"
          ],
          "highlightWord": "મુખ્ય મુદ્દા",
          "iconName": "CheckCircle2",
          "narrationScript": "યાદ રાખો: અવરોધ અચળ હોય ત્યારે વોલ્ટેજ વધે તો પ્રવાહ વધે છે, અને ઓહ્મનો નિયમ દરેક સુરક્ષિત ઇલેક્ટ્રોનિક ડિઝાઇનનો આધાર છે.",
          "accentColor": "#059669",
          "durationInFrames": 457,
          "durationInSeconds": 14.712,
          "audioUrl": "/demos/ohms-law-gu/scene-4.mp3",
          "captions": [
            {
              "text": "યાદ",
              "startMs": 100,
              "endMs": 475
            },
            {
              "text": "રાખો",
              "startMs": 525,
              "endMs": 1013
            },
            {
              "text": "અવરોધ",
              "startMs": 1175,
              "endMs": 1600
            },
            {
              "text": "અચળ",
              "startMs": 1700,
              "endMs": 2038
            },
            {
              "text": "હોય",
              "startMs": 2063,
              "endMs": 2363
            },
            {
              "text": "ત્યારે",
              "startMs": 2475,
              "endMs": 2825
            },
            {
              "text": "વોલ્ટેજ",
              "startMs": 2863,
              "endMs": 3450
            },
            {
              "text": "વધે",
              "startMs": 3450,
              "endMs": 3800
            },
            {
              "text": "તો",
              "startMs": 3913,
              "endMs": 4063
            },
            {
              "text": "પ્રવાહ",
              "startMs": 4163,
              "endMs": 4538
            },
            {
              "text": "વધે",
              "startMs": 4550,
              "endMs": 4875
            },
            {
              "text": "છે",
              "startMs": 4913,
              "endMs": 5225
            },
            {
              "text": "અને",
              "startMs": 5575,
              "endMs": 5838
            },
            {
              "text": "ઓહ્મનો",
              "startMs": 5900,
              "endMs": 6400
            },
            {
              "text": "નિયમ",
              "startMs": 6438,
              "endMs": 6800
            },
            {
              "text": "દરેક",
              "startMs": 6875,
              "endMs": 7200
            },
            {
              "text": "સુરક્ષિત",
              "startMs": 7238,
              "endMs": 7800
            },
            {
              "text": "ઇલેક્ટ્રોનિક",
              "startMs": 7900,
              "endMs": 8613
            },
            {
              "text": "ડિઝાઇનનો",
              "startMs": 8713,
              "endMs": 9338
            },
            {
              "text": "આધાર",
              "startMs": 9350,
              "endMs": 9825
            },
            {
              "text": "છે",
              "startMs": 9888,
              "endMs": 10175
            }
          ],
          "code": "export default function GeneratedScene({ frame, fps, durationInFrames, palette, accentColor, isPortrait, heading, subtext }) {\n    const takeaways = [\n      \"વિદ્યુત પરિપથની ચોક્કસ ગણતરી માટે ઉપયોગી\",\n      \"ઘરેલું ઉપકરણો માટે સુરક્ષિત વિદ્યુત પ્રવાહ નિયંત્રણ\",\n      \"ઇલેક્ટ્રોનિક્સ અને સેમિકન્ડક્ટર ડિઝાઇનનો પાયો\"\n    ];\n    return (\n      <div style={{ display: \"flex\", flexDirection: \"column\", width: \"100%\", height: \"100%\", alignItems: \"center\", justifyContent: \"center\", padding: isPortrait ? \"60px 48px 300px 48px\" : \"60px 80px 180px\", boxSizing: \"border-box\" }}>\n        <h1 style={{ fontSize: isPortrait ? \"34px\" : \"48px\", fontWeight: 800, color: palette.textPrimary, marginBottom: \"32px\", textAlign: \"center\" }}>{heading}</h1>\n        <div style={{ display: \"flex\", flexDirection: \"column\", gap: \"16px\", width: \"100%\", maxWidth: \"800px\" }}>\n          {takeaways.map((t, i) => (\n            <div key={i} style={{ backgroundColor: palette.surface, border: \"1px solid \" + palette.border, borderRadius: \"16px\", padding: \"18px 24px\", display: \"flex\", alignItems: \"center\", gap: \"16px\" }}>\n              <div style={{ width: \"32px\", height: \"32px\", borderRadius: \"50%\", backgroundColor: accentColor + \"22\", display: \"flex\", alignItems: \"center\", justifyContent: \"center\", color: accentColor, fontWeight: \"bold\" }}>✓</div>\n              <p style={{ fontSize: isPortrait ? \"18px\" : \"20px\", color: palette.textPrimary, margin: 0 }}>{t}</p>\n            </div>\n          ))}\n        </div>\n      </div>\n    );\n  }",
          "modelUsed": "gemini-3.8-flash",
          "isCorrected": false,
          "isPlaceholder": false
        }
      ],
      "totalDurationInFrames": 1732
    }
  }
];

export const SHOWCASE_PRESETS: ShowcasePreset[] = RAW_SHOWCASE_PRESETS.map(
  (preset) => ({
    ...preset,
    project: VideoProjectSchema.parse(preset.project),
  })
);

export const DEFAULT_SHOWCASE_PROJECT: VideoProject = SHOWCASE_PRESETS[0].project;
