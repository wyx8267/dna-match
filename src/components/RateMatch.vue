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
        <el-col :span="16">
          <el-form-item label="最小匹配率(%)">
            <el-input-number
              v-model="form.minMatchRate"
              :min="0"
              :max="100"
              :controls="false"
            />
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
      <el-col :span="16" v-if="resultData.length > 0">
        <el-table :data="resultData" border>
          <el-table-column prop="position" label="位置" >
            <template #default="scope">{{ scope.row.position + 1 }}</template>
          </el-table-column>
          <el-table-column prop="matchRate" label="匹配率" >
            <template #default="scope">{{ scope.row.matchRate * 100 }}%</template>
          </el-table-column>
          <el-table-column prop="length" label="序列长度" >
            <template #default="scope">{{ scope.row.sequence.length }}</template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import InputArea from "./InputArea.vue";
import { transformOptions, transformMap } from "../utils/option";
import { DNASequenceMatcher } from "../utils/calc";

const form = reactive({
  source: "",
  sourceType: "common",
  target: "",
  targetType: "common",
});

const resultData = ref([]);
const show = ref(false);

const handleSubmit = () => {
  if (!form.minMatchRate) {
    ElMessage.error("最小匹配率不能为空");
    return;
  }
  const minMatchRate = form.minMatchRate / 100;
  console.time("相似度匹配");
  if (form.source && form.sourceType) {
    form.source = transformMap[form.sourceType](form.source);
    form.source = form.source.replace(/\s/g, "");
  }
  if (form.target && form.targetType) {
    form.target = transformMap[form.targetType](form.target);
    form.target = form.target.replace(/\s/g, "");
  }
  try {
    const matcher = new DNASequenceMatcher(form.source, form.target);
    resultData.value = matcher.search(minMatchRate);
    show.value = true;
    console.timeEnd("相似度匹配");
  } catch (error) {
    console.error(error)
    ElMessage.error("搜索出错");
  }
};
</script>

<style scoped lang="scss"></style>
