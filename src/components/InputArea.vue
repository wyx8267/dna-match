<template>
  <div>
    <div style="display: flex;">
      <el-input
        v-model="text"
        type="textarea"
        :rows="props.rows || 5"
        :cols="props.cols || 100"
      />
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
import { ref, defineProps } from "vue";

const props = defineProps(["modelValue", "rows", "cols"]);

const emit = defineEmits(["update:modelValue"]);

const text = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const handleUpload = (file) => {
  console.log(file);
  let reader = new FileReader();
  reader.readAsText(file.raw);
  reader.onload = () => {
    text.value = reader.result;
  };
};
</script>

<style scoped lang="scss"></style>
