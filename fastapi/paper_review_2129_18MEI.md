# Review: Paper IEEE Xplore
## "Evaluation of HVI-CIDNet-based Image Enhancement for Low-Light Object Detection on ExDark with YOLOv11"
> **Reviewer Perspective**: Simulates feedback from a senior IEEE reviewer, a methodology critic, and a writing/language editor.
> **Updated**: Full numerical data from `REPORT_18MEI_26.txt` now incorporated.

---

## 🗂️ Actual Data Reference (from your `REPORT_18MEI_26.txt`)

Before diving into feedback, here are your real numbers — use these directly in the paper.

### Table 1: Spatial Quality Metrics per Scenario

| Metric | S1 Raw | S2 HVI-CIDNet | S3 RetinexFormer | S4 LYT-Net |
|---|---|---|---|---|
| Mean Luminance | 33.69 | **114.59** | 92.41 | 96.88 |
| Shadow Area (%) | 66.10% | 11.64% | 21.61% | 13.65% |
| RMS Contrast | 35.17 | 61.02 | 56.49 | 57.83 |
| Noise σ | **4.515** | 7.427 | 6.833 | 7.136 |
| EPI | **1.0000** | 0.2004 | 0.2396 | 0.2696 |
| Edge Density | 4.28% | 11.21% | 9.25% | 9.14% |
| NIQE ↓ | 5.177 | **3.916** | 3.941 | 4.329 |
| BRISQUE ↓ | 31.136 | 25.743 | **17.175** | 26.413 |
| LOE ↓ | N/A | 6.218 | 6.821 | **4.462** |

### Table 2: Detection Performance Comparison

| Scenario | mAP@0.5 | mAP@0.5:0.95 | Precision | Recall |
|---|---|---|---|---|
| S1 Raw (Baseline) | **0.5576** | **0.3309** | **0.6312** | 0.5146 |
| S2 HVI-CIDNet | 0.5491 | 0.3253 | 0.6153 | **0.5173** |
| S3 RetinexFormer | 0.5361 | 0.3181 | 0.5927 | 0.5130 |
| S4 LYT-Net | 0.5365 | 0.3184 | 0.6165 | 0.5017 |

### Table 3: System Latency

| Scenario | T_enhance (ms) | T_detect (ms) | GFLOPs |
|---|---|---|---|
| S1 Raw | 0.00 | 14.52 ± 10.53 | 3.226 |
| S2 HVI-CIDNet | 100.53 | 12.89 ± 9.97 | 3.226 |
| S3 RetinexFormer | **356.29** | 14.39 ± 11.91 | 3.226 |
| S4 LYT-Net | 101.67 | 15.61 ± 11.25 | 3.226 |

---

## 🔴 Critical Issues (Must Fix Before Submission)

### 1. Placeholders Not Removed — Paper Is Not Submittable

Both `paper.tex` (Indonesian) and `paper eng.tex` (English) still contain **7 placeholder figure comments** and 2 internal instruction blocks that must be removed:

```latex
% [PLACEHOLDER_FIGURE_1: ...]   ← These must go
% [PLACEHOLDER_FIGURE_2: ...]   ← These must go
% THE FOLLOWING IS THE LAYOUT FOR SUBSEQUENT CHAPTERS  ← Must go
```
And the corresponding `\begin{figure}...\end{figure}` blocks with actual images must be inserted. **Reviewer will reject immediately.**

---

### 2. Abstract Still Prospective — Must Report Actual Results

The English version abstract still reads:
> *"The results of this study **are expected to** provide empirical insights..."*

This is a fatal flaw. For an IEEE conference paper (completed research), the abstract must state what **was found**, not what is expected. You now have the numbers — use them.

**Draft replacement abstract:**
```
Image quality in low-light conditions represents a critical challenge for
object detection systems in computer vision. This paper presents a systematic
empirical evaluation of the impact of state-of-the-art Low-Light Image
Enhancement (LLIE) preprocessing—namely HVI-CIDNet, RetinexFormer, and
LYT-Net—on the performance of a YOLOv11n object detector trained and
evaluated on the Exclusively Dark (ExDark) dataset (7,363 images, 12 classes).
Contrary to the conventional assumption that visual enhancement aids detection,
our results demonstrate that raw low-light images (S1) consistently outperform
all enhanced variants, achieving mAP@0.5 of 55.76% versus 54.91%, 53.61%,
and 53.65% for HVI-CIDNet, RetinexFormer, and LYT-Net respectively. Spatial
analysis reveals that LLIE algorithms drastically reduce the Edge Preservation
Index (EPI) from 1.000 (raw) to as low as 0.200, while increasing noise levels
by up to 64.5%. EigenCAM and Mean Activation Map visualizations confirm that
LLIE preprocessing disorients YOLOv11's spatial attention away from object
semantic features toward background noise artifacts. These findings expose a
fundamental disconnect between human-centric perceptual optimization and
machine-vision-centric gradient preservation, guiding future research toward
task-driven enhancement architectures.
```

---

### 3. Self-Citation to Internal/Unpublished Documents

Three citations point to documents that cannot be verified by reviewers or readers:

```bibtex
\cite{report2026internal}  % Internal evaluation report — not public
\cite{proposal2026sempro}  % Seminar proposal — not public
\cite{metrics2026formulas} % Technical note — not public
```

**Action**: All methodology details (EPI formula, training parameters, dataset split) must be stated directly in the paper body, not cited to private documents. Remove these citations.

---

### 4. BibTeX Entries Missing Critical Fields

Most entries are missing `journal`, `volume`, `pages`, and `doi`. IEEEtran will generate malformed references.

**Worst offenders (minimum fields needed for IEEE submission):**

```bibtex
% Current — broken:
@article{khanam2024yolov11,
  author = {Khanam, Rahima and Hussain, Muhammad},
  title  = {YOLOv11: An Overview ...},
  year   = {2024},
}

% Should be (arXiv preprint):
@article{khanam2024yolov11,
  author        = {Khanam, Rahima and Hussain, Muhammad},
  title         = {{YOLOv11}: An Overview of the Key Architectural Enhancements},
  journal       = {arXiv preprint arXiv:2410.17725},
  year          = {2024},
  eprint        = {2410.17725},
  archivePrefix = {arXiv},
}
```

Check and complete: `wu2024llieeffect`, `yan2025hvi`, `brateanu2025lytnet`, `gong2025multiscale`, `wang2023yolov5lowlight`, `sapkota2025yoloreview`, `peng2024yolov5llie`, `darmawan2025vitra`, `akavaram2025flops`.

---

### 5. Irrelevant Entry in BibTeX

```bibtex
@article{oishi2021network,
  title = {A study on interconnection between local 5G networks and existing networks}
}
```
This is completely unrelated to your paper. Also, `gries_hazzan_cs` has no year and is a generic CS textbook not cited in the paper body. Remove both.

---

### 6. No Explicit Contributions List in Introduction

IEEE reviewers specifically look for a bulleted contributions paragraph. The current Introduction ends with a general description of the study — no "The main contributions of this paper are:" statement. Add one.

---

## 🟡 Major Issues (Significant Improvements Needed)

### 7. The Performance Gap Is Narrow — You Must Address This

This is the **most critical analytical weakness** a reviewer will attack. Looking at your actual numbers:

| | mAP@0.5 | Δ vs S1 |
|---|---|---|
| S1 Raw | 0.5576 | — |
| S2 HVI-CIDNet | 0.5491 | **−0.85%** |
| S3 RetinexFormer | 0.5361 | **−2.15%** |
| S4 LYT-Net | 0.5365 | **−2.11%** |

A reviewer will challenge: *"These differences are tiny (~1-2%). Are they statistically significant? Could this be due to random seed variance during training?"*

**Action**: You must address this directly. Either:
- (a) Run each scenario 3× with different seeds and report mean ± std, OR
- (b) Explicitly acknowledge in the paper that the magnitude is modest but the **direction is consistent across all 3 LLIE methods** and is corroborated by the **qualitative EigenCAM evidence** — which makes the pattern a reliable trend.

---

### 8. EPI Formula Undefined in the Paper

EPI is your **key discriminating metric** and the most original technical contribution, yet it is never defined. Reviewers cannot evaluate it without a formula.

**Add to Section 3.4 (Evaluation Metrics):**
```latex
The Edge Preservation Index (EPI) quantifies the structural similarity
of edges between the original and processed image:
\begin{equation}
  \text{EPI} = \frac{\sum_{x,y} G_e(x,y) \cdot G_o(x,y)}
                    {\sqrt{\sum_{x,y} G_e^2(x,y) \cdot \sum_{x,y} G_o^2(x,y)}}
\end{equation}
where $G_e$ and $G_o$ denote the gradient magnitude of the enhanced and
original images, respectively. A value of 1.0 indicates perfect edge
preservation, while lower values indicate structural degradation.
```
*(Adjust formula to match your actual implementation in `interpretability.py`.)*

---

### 9. Latency Data Exists But Is Not Discussed

Your report has latency data that tells a compelling additional story:

- **RetinexFormer adds 356 ms overhead** — entirely unacceptable for real-time scenarios
- **HVI-CIDNet and LYT-Net add ~100 ms** — also breaks real-time (>30 FPS requires <33ms)

This is a secondary finding that reinforces why LLIE preprocessing is problematic — it's not just accuracy, it's also **inference speed**. A table and one paragraph in Results would significantly strengthen the paper.

---

### 10. No Limitations Section

IEEE papers at this level are expected to acknowledge limitations. Currently the Conclusion only describes future work. Add 2-3 sentences:
- Only YOLOv11n was tested (nano variant)
- LLIE models used were trained on LOLv1, not ExDark (domain gap)
- Statistical significance not formally tested

---

### 11. EigenCAM Citation Missing

EigenCAM is attributed only to your internal `\cite{metrics2026formulas}`. The actual EigenCAM paper is:
> Muhammad, M. B., & Yeasin, M. (2020). *Eigen-CAM: Class Activation Map using Principal Components*. IJCNN 2020.

Add this citation properly.

---

## 🟢 Minor Issues (Polish)

### 12. Inconsistent Dataset Name

- Body text uses `ExDARK` (capital R, K)
- Original paper (Loh & Chan, 2019) uses `ExDark`

Standardize to **ExDark** throughout.

### 13. Citation Style

Replace `\cite{a}, \cite{b}` with `\cite{a,b}` for cleaner IEEE output: `[1,2]` instead of `[1], [2]`.

### 14. "Layer N" Is Vague

In Methodology, "Layer N" is mentioned multiple times. Specify the exact layer index (e.g., `model.model[9]` or `backbone stage 3 output`) so reviewers can reproduce your interpretability results.

### 15. `\usepackage{hyperref}` May Conflict

In IEEEtran conference mode, `hyperref` can cause issues. Use:
```latex
\usepackage[hidelinks]{hyperref}
```
or remove it if links aren't needed in the final PDF.

### 16. Keyword Additions

Current keywords: `Low-Light Image Enhancement, Object Detection, HVI-CIDNet, YOLOv11, ExDark`

Add: `EigenCAM, Edge Preservation Index, Feature Degradation, Task-Driven Enhancement`

---

## ✅ Strengths (Preserve and Emphasize)

| Aspect | Comment |
|---|---|
| **Counter-intuitive finding** | "Raw beats enhanced" is a compelling, publishable insight |
| **Three-LLIE comparison** | Comparing 3 SOTA methods makes the conclusion more generalizable |
| **EigenCAM + MAM dual interpretability** | Rare combination in this type of study; strong methodological contribution |
| **EPI metric** | Original use of EPI for machine-vision impact is a genuine novelty |
| **Latency data** | The 356ms RetinexFormer overhead is a real-world impactful finding |
| **ExDark dataset** | Right choice; specific and well-cited |
| **Related Work structure** | Three well-organized subsections covering LLIE, YOLO evolution, and the machine-vision gap |

---

## 📋 Prioritized Checklist

```
CRITICAL — Do First:
[ ] 1. Rewrite abstract with actual results (use draft above)
[ ] 2. Insert all 7 figures (delete all PLACEHOLDERs and comments)
[ ] 3. Add explicit "Contributions" bullet list at end of Introduction
[ ] 4. Remove \cite{report2026internal}, \cite{proposal2026sempro}, \cite{metrics2026formulas}
[ ] 5. Move all methodology details (training params, dataset split) to paper body directly
[ ] 6. Complete BibTeX fields (journal/arXiv ID, volume, pages, DOI)
[ ] 7. Remove oishi2021network and gries_hazzan_cs entries

HIGH — Do Before Final Draft:
[ ] 8. Insert Table 1 (Spatial Metrics) and Table 2 (Detection Performance) in Results
[ ] 9. Add Table 3 (Latency comparison) + 1 paragraph in Results discussing real-time implications
[ ] 10. Define EPI formula in Section 3.4 with an equation
[ ] 11. Add EigenCAM citation (Muhammad & Yeasin, IJCNN 2020)
[ ] 12. Address narrow performance gap explicitly — either add std/seeds or argue direction+EigenCAM
[ ] 13. Add Limitations paragraph to Conclusion

POLISH — Before Submission:
[ ] 14. Standardize "ExDark" (not "ExDARK") everywhere
[ ] 15. Replace \cite{a}, \cite{b} → \cite{a,b}
[ ] 16. Specify exact "Layer N" index in Methodology
[ ] 17. Fix \usepackage[hidelinks]{hyperref}
[ ] 18. Expand keyword list
```

---

## 🔮 Positioning & Conference Suggestions

**Title**: Consider rephrasing to signal the counter-intuitive finding:
> *"Does LLIE Help or Hurt? Empirical Evaluation of HVI-CIDNet Preprocessing for YOLOv11 Object Detection on ExDark"*

**Target Conferences**:
| Conference | Scope Match | Notes |
|---|---|---|
| **ICCEREC** (IEEE Indonesia) | ✅ High | Image processing + computer vision |
| **ICICSE** | ✅ High | Applied ML/CV |
| **IEEE Access** (journal) | ✅ High | Open access, broader reach |
| **ICIP** (IEEE Image Processing) | ⚠️ Medium | More competitive, higher bar |

**Page Limit**: Most IEEE conferences = 6 pages. With 7 figures + 3 tables, you will need to be concise. Plan your page budget before writing final draft.
