import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";

let model: mobilenet.MobileNet | null = null;

export const loadModel = async () => {
  if (!model) {
    await tf.ready();
    model = await mobilenet.load();
  }
  return model;
};

export const validateGarbageImage = async (image: HTMLImageElement) => {
  const model = await loadModel();
  const predictions = await model.classify(image);

  const garbageKeywords = [
    "trash",
    "garbage",
    "plastic",
    "waste",
    "dump",
    "bottle",
    "can",
    "pollution",
  ];

  const garbageMatches = predictions.filter(p =>
    garbageKeywords.some(k =>
      p.className.toLowerCase().includes(k)
    )
  );

  const confidence = Math.min(
    100,
    Math.round(
      garbageMatches.reduce((sum, p) => sum + p.probability, 0) * 100
    )
  );

  return {
    isGarbage: garbageMatches.length > 0,
    confidence,
  };
};
