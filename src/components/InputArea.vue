<template>
  <div>
    <div style="display: flex;">
      <div ref="editor" :style="{ width: '800px', height: props.height || '200px', border: '1px solid #ccc' }"></div>
      <el-link type="primary" :underline="false" style="align-self: flex-end; width: 40px" @click="text = ''"
        >清空</el-link>
    </div>
    <el-upload
      ref="uploadRef"
      :auto-upload="false"
      :on-change="handleUpload"
      :limit="1"
      :show-file-list="false"
    >
      <template #trigger>
        <el-button type="primary">上传文件</el-button>
      </template>
    </el-upload>
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted } from "vue";
import Quill from 'quill';

const editor = ref(null);
const quill = ref(null);

onMounted(() => {
  quill.value = new Quill(editor.value);
  quill.value.setText(props.modelValue);
  quill.value.on('text-change', () => {
    emit("update:modelValue", quill.value.getText());
  });
});

const props = defineProps(["modelValue", "height"]);

const emit = defineEmits(["update:modelValue"]);

watch(() => props.modelValue, (value) => {
  quill.value.setText(value);
});

const handleUpload = (file) => {
  console.log(file);
  let reader = new FileReader();
  reader.readAsText(file.raw);
  reader.onload = () => {
    quill.value.setText(reader.result);
  };
};
</script>

<style scoped lang="scss"></style>
