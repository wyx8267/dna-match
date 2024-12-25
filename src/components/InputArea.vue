<template>
  <div>
    <div style="display: flex">
      <!-- <div
        ref="editor"
        :style="{
          width: '800px',
          height: props.height || '200px',
          border: '1px solid #ccc',
        }"
      ></div> -->
      <Editor
      :style="{
          width: '800px',
          height: props.height || '200px',
          border: '1px solid #ccc',
        }"
        mode="simple"
        @onCreated="handleCreated"
        @onChange="handleChange"
      />
      <el-link
        type="primary"
        :underline="false"
        style="align-self: flex-end; width: 40px"
        @click="handleClear"
        >清空</el-link
      >
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
import { defineProps, shallowRef, onBeforeUnmount } from "vue";
import "@wangeditor/editor/dist/css/style.css";
import { Editor } from "@wangeditor/editor-for-vue";

const editorRef = shallowRef();

const handleCreated = (editor) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};

const handleChange = (editor) => {
  emit("update:modelValue", editor.getText());
};

const handleClear = () => {
  editorRef.value.setText("");
};

const props = defineProps(["modelValue", "height"]);

const emit = defineEmits(["update:modelValue"]);

watch(() => props.modelValue, (newValue) => {
  editorRef.value.setHtml(newValue);
});

const handleUpload = (file) => {
  console.log(file);
  let reader = new FileReader();
  reader.readAsText(file.raw);
  reader.onload = () => {
    editorRef.value.setHtml(reader.result);
  };
};

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>

<style scoped>
.ql-clipboard {
  position: fixed;
  display: none;
  left: 50%;
  top: 50%;
}
</style>
