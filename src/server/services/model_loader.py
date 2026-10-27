"""Load the bundled emotion-classification weights with compatible inference-only metadata."""
import json
from functools import lru_cache
import h5py
from config import MODEL_PATH

# Variables, not functions:
model = load_model(MODEL_PATH, compile=False)
emotion_labels = ['angry', 'disgust', 'afraid', 'happy', 'neutral', 'sad', 'surprise']
emotion_scores = {'happy': 0, 'surprise': 1, 'neutral': 0, 'disgust': 1, 'sad': 2, 'afraid': 3, 'angry': 3}
max_score = 3


def inference_config(value):
    if isinstance(value, list):
        return [inference_config(item) for item in value]
    if not isinstance(value, dict):
        return value
    result = {key: inference_config(item) for key, item in value.items()}
    kind = result.get('class_name')
    config = result.get('config', {})
    if kind == 'InputLayer':
        config.pop('optional', None)
        if 'batch_input_shape' in config:
            config['batch_shape'] = config.pop('batch_input_shape')
    if kind == 'GlorotUniform':
        # Newer Keras records these optional axes as None. Removing those null
        # fields preserves the initializer; inference uses saved weights anyway.
        for key in ('input_axes', 'output_axes'):
            if config.get(key) is None:
                config.pop(key, None)
    if kind == 'BatchNormalization' and not config.get('renorm', False):
        for key in ('renorm', 'renorm_clipping', 'renorm_momentum'):
            config.pop(key, None)
    if kind == 'Dense' and config.get('quantization_config') is None:
        config.pop('quantization_config', None)
    return result


@lru_cache(maxsize=1)
def get_model():
    import keras
    with h5py.File(MODEL_PATH) as handle:
        config = inference_config(json.loads(handle.attrs['model_config']))
    if config['class_name'] != 'Sequential':
        raise ValueError('Expected the bundled sequential emotion model.')
    model = keras.Sequential.from_config(config['config'])
    model.load_weights(MODEL_PATH)
    if model.input_shape != (None, 48, 48, 1) or model.output_shape[-1] != 7:
        raise ValueError('Unexpected ASTRA model input/output dimensions.')
    return model
