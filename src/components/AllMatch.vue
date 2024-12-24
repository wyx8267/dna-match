<template>
  <div>
    <el-form :model="form" label-width="auto" style="width: 100%" inline>
      <el-row>
        <el-col :span="16">
          <el-form-item label="源序列">
            <InputArea v-model="form.source" :rows="8" />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="源序列文本转换">
            <el-select style="width: 200px" v-model="form.sourceType">
              <el-option
                v-for="item in transformOptions"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="目标序列">
            <InputArea v-model="form.target" />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="目标序列文本转换">
            <el-select style="width: 200px" v-model="form.targetType">
              <el-option
                v-for="item in transformOptions"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="4" :offset="4">
          <el-button style="width: 100%" type="primary" @click="handleSubmit"
            >搜索</el-button
          >
        </el-col>
      </el-row>
    </el-form>
    <br />
    <el-row>
      <el-col :span="16" v-if="show"> 匹配结果：找到 {{ matches.length }} 个匹配 </el-col>
      <el-col :span="16" v-if="show && matches.length > 0">
        匹配位置：{{ matches.map((o) => o + 1).join(", ") }}
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import InputArea from "./InputArea.vue";
import { transformOptions, transformMap } from "../utils/option";
import { DNASequenceFinder } from "../utils/calc";

const form = reactive({
  source: "",
  sourceType: "common",
  target: "",
  targetType: "common",
});

const matches = ref([]);
const show = ref(false);

const handleSubmit = () => {
  console.time("全匹配搜索");
  if (form.source && form.sourceType) {
    form.source = transformMap[form.sourceType](form.source);
    form.source = form.source.replace(/\s/g, "");
  }
  if (form.target && form.targetType) {
    form.target = transformMap[form.targetType](form.target);
    form.target = form.target.replace(/\s/g, "");
  }
  try {
    matches.value = DNASequenceFinder.search(form.source, form.target);
    console.log(`找到 ${matches.value.length} 个匹配`);
    show.value = true;
    console.timeEnd("全匹配搜索");
  } catch (error) {
    ElMessage.error("搜索出错:", error);
  }
};
</script>

<style scoped lang="scss"></style>
