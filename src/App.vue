<template>
  <div class="app">
    <el-form :model="form" label-width="auto" inline>
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
        <el-col :span="16">
          <el-form-item label="使用简并碱基">
            <el-switch v-model="form.useDegenerate" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="4" :offset="4">
          <el-button
            style="width: 100%"
            type="primary"
            @click="handleSubmit"
            :disabled="loading"
            >搜索</el-button
          >
        </el-col>
      </el-row>
    </el-form>
    <br />
    <el-row>
      <el-col :span="16" v-if="resultData.length > 0">
        <el-table :data="resultData" border>
          <el-table-column prop="position" label="位置">
            <template #default="scope">{{ scope.row.position + 1 }}</template>
          </el-table-column>
          <el-table-column prop="matchRate" label="匹配率">
            <template #default="scope"
              >{{ scope.row.matchRate * 100 }}%</template
            >
          </el-table-column>
          <el-table-column prop="length" label="序列长度">
            <template #default="scope">{{
              scope.row.sequence.length
            }}</template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import InputArea from "./components/InputArea.vue";
import { transformOptions, transformMap } from "./utils/option";
import { DNASequenceMatcher } from "./utils/calc";

const form = reactive({
  source: "",
  sourceType: "common",
  target: "",
  targetType: "common",
  minMatchRate: 100,
  useDegenerate: false,
});

const resultData = ref([]);
const loading = ref(false);
const handleSubmit = async () => {
  if (!form.minMatchRate) {
    ElMessage.error("最小匹配率不能为空");
    return;
  }
  const minMatchRate = form.minMatchRate / 100;
  console.time("DNA MATCH");
  loading.value = true;
  if (form.source && form.sourceType) {
    form.source = transformMap[form.sourceType](form.source);
    form.source = form.source.replace(/\s/g, "");
  }
  if (form.target && form.targetType) {
    form.target = transformMap[form.targetType](form.target);
    form.target = form.target.replace(/\s/g, "");
  }
  resultData.value = [];
  try {
    const matcher = new DNASequenceMatcher(form.source);
    // resultData.value = await matcher.search(
    //   form.target,
    //   minMatchRate,
    //   form.useDegenerate
    // );
    for await (const batch of matcher.searchStream(form.target, {
      batchSize: 100,
      minMatchRate,
      useDegenerate: form.useDegenerate,
    })) {
      // 模拟异步处理每个批次
      await new Promise((resolve) => setTimeout(resolve, 100));
      console.log('\x1b[97m\x1b[41mbatch==>\x1b[0m', batch);
      resultData.value.push(...batch);
      // 这里可以添加其他处理逻辑
      // 例如：将结果写入文件、发送到服务器等
    }
    console.log("\x1b[97m\x1b[41mresultData.value==>\x1b[0m", resultData.value);
    console.timeEnd("DNA MATCH");
    ElMessage.success("搜索完成");
  } catch (error) {
    console.error(error);
    ElMessage.error("搜索出错");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.app {
  padding: 50px;
  width: 100vw;
  height: 100vh;
  overflow: auto;
  min-width: 1000px;
}
</style>
