"""Regenerate plot_04.png (NN ensemble confusion matrix)."""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

TN, FP = 1095, 25
FN, TP = 18, 80
counts = np.array([[TN, FP], [FN, TP]])
row_sums = counts.sum(axis=1, keepdims=True)
norm = counts / row_sums  # row-normalized

labels = ["No callback", "Callback"]

purple = LinearSegmentedColormap.from_list("nn_purple", ["#f4f0fa", "#3b0a6b"])
green  = LinearSegmentedColormap.from_list("nn_green",  ["#eaf5ec", "#0d4f25"])

fig, axes = plt.subplots(1, 2, figsize=(11, 4.5))

def draw(ax, data, cmap, title, fmt):
    vmax = data.max() if fmt == "d" else 1.0
    im = ax.imshow(data, cmap=cmap, vmin=0, vmax=vmax)
    ax.set_xticks([0, 1]); ax.set_yticks([0, 1])
    ax.set_xticklabels(labels); ax.set_yticklabels(labels)
    ax.set_xlabel("Predicted label"); ax.set_ylabel("True label")
    ax.set_title(title)
    for i in range(2):
        for j in range(2):
            v = data[i, j]
            txt = f"{v:d}" if fmt == "d" else f"{v*100:.2f}%"
            # white text on dark cells, dark text on light cells
            shade = (data[i, j] / vmax) if vmax else 0
            color = "white" if shade > 0.55 else ("#2a094b" if cmap is purple else "#06381a")
            ax.text(j, i, txt, ha="center", va="center", color=color, fontsize=12)
    ax.set_xticks(np.arange(-.5, 2, 1), minor=True)
    ax.set_yticks(np.arange(-.5, 2, 1), minor=True)
    ax.grid(which="minor", color="white", linewidth=2)
    ax.tick_params(which="minor", length=0)

draw(axes[0], counts, purple, "NN ensemble — confusion matrix (counts)", "d")
draw(axes[1], norm,   green,  "NN ensemble — row-normalized",            "f")

plt.tight_layout()
plt.savefig(r"C:\Users\Leon\Downloads\research_website\images\plot_04.png", dpi=120, bbox_inches="tight")
print("wrote plot_04.png with TN=%d FP=%d FN=%d TP=%d (FP+FN=%d)" % (TN, FP, FN, TP, FP+FN))
