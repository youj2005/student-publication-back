import { pipeline, env } from '@xenova/transformers';

// Specify a custom location for models (defaults to '/models/').
env.localModelPath = './models/';

// Disable the loading of remote models from the Hugging Face Hub:
env.allowRemoteModels = false;


class TopicClassificationPipeline {
  static task = 'zero-shot-classification';
  static model = 'Xenova/DeBERTa-v3-base-mnli-fever-anli';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {

      // NOTE: Uncomment this to change the cache directory
      // env.cacheDir = './.cache';

      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}



class BiasClassificationPipeline {
  static task = 'text-classification';
  static model = 'distilroberta-bias-onnx';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {

      // NOTE: Uncomment this to change the cache directory
      // env.cacheDir = './.cache';

      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

export {TopicClassificationPipeline, BiasClassificationPipeline};