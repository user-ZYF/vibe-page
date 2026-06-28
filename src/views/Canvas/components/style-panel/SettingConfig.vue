<!-- ? 元素设置配置面板 -->
<template>
  <div>
    <!-- 元素 ID -->
    <div class="style-config-section">
      <div class="style-config-label">ID</div>
      <a-input
        :value="model.id"
        size="small"
        class="style-config-input"
        @focus="handleIdFocus"
        @blur="handleIdBlur"
      />
    </div>

    <!-- 按钮 -->
    <template v-if="model.type === CanvasElementTypeEnum.BUTTON">
      <div class="style-config-section">
        <div class="style-config-label">按钮文本</div>
        <a-input v-model:value="pendingText" size="small" class="style-config-input" @blur="commitText" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">按钮类型</div>
        <a-select v-model:value="(model as CanvasButtonElement).buttonType" size="small" class="style-config-select" :options="BUTTON_TYPE_OPTIONS" />
      </div>
    </template>

    <!-- 段落 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.PARAGRAPH">
      <div class="style-config-section">
        <div class="style-config-label">段落文本</div>
        <a-textarea v-model:value="pendingText" :rows="3" size="small" @blur="commitText" />
      </div>
    </template>

    <!-- 图片 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.IMAGE">
      <div class="style-config-section">
        <div class="style-config-label">图片地址</div>
        <a-input v-model:value="(model as CanvasImageElement).src" size="small" class="style-config-input" placeholder="https://" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">图片标题</div>
        <a-input v-model:value="(model as CanvasImageElement).title" size="small" class="style-config-input" />
      </div>
    </template>

    <!-- 超链接 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.LINK">
      <div class="style-config-section">
        <div class="style-config-label">链接文本</div>
        <a-input v-model:value="pendingText" size="small" class="style-config-input" @blur="commitText" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">链接地址</div>
        <a-input v-model:value="(model as CanvasLinkElement).href" size="small" class="style-config-input" placeholder="https://" />
      </div>
    </template>

    <!-- 单行文本框 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.INPUT">
      <div class="style-config-section">
        <div class="style-config-label">占位提示</div>
        <a-input v-model:value="(model as CanvasInputElement).placeholder" size="small" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">默认值</div>
        <a-input v-model:value="(model as CanvasInputElement).value" size="small" class="style-config-input" />
      </div>
    </template>

    <!-- 多行文本框 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.TEXTAREA">
      <div class="style-config-section">
        <div class="style-config-label">占位提示</div>
        <a-input v-model:value="(model as CanvasTextareaElement).placeholder" size="small" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">默认值</div>
        <a-input v-model:value="(model as CanvasTextareaElement).value" size="small" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">行数</div>
        <a-input-number v-model:value="(model as CanvasTextareaElement).rows" size="small" class="style-config-input-number" :min="1" />
      </div>
    </template>

    <!-- 单选框 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.RADIO">
      <div class="style-config-section">
        <div class="style-config-label">单选组名称</div>
        <a-input v-model:value="(model as CanvasRadioElement).name" size="small" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">选项值</div>
        <a-input v-model:value="(model as CanvasRadioElement).value" size="small" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <a-checkbox v-model:checked="(model as CanvasRadioElement).checked">默认选中</a-checkbox>
      </div>
    </template>

    <!-- 多选框 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.CHECKBOX">
      <div class="style-config-section">
        <div class="style-config-label">多选组名称</div>
        <a-input v-model:value="(model as CanvasCheckboxElement).name" size="small" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">选项值</div>
        <a-input v-model:value="(model as CanvasCheckboxElement).value" size="small" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <a-checkbox v-model:checked="(model as CanvasCheckboxElement).checked">默认选中</a-checkbox>
      </div>
    </template>

    <!-- 视频 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.VIDEO">
      <div class="style-config-section">
        <div class="style-config-label">视频地址</div>
        <a-input v-model:value="(model as CanvasVideoElement).src" size="small" class="style-config-input" placeholder="https://" />
      </div>
      <div class="style-config-section">
        <a-checkbox v-model:checked="(model as CanvasVideoElement).controls">显示控件</a-checkbox>
      </div>
    </template>

    <!-- 音频 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.AUDIO">
      <div class="style-config-section">
        <div class="style-config-label">音频地址</div>
        <a-input v-model:value="(model as CanvasAudioElement).src" size="small" class="style-config-input" placeholder="https://" />
      </div>
      <div class="style-config-section">
        <a-checkbox v-model:checked="(model as CanvasAudioElement).controls">显示控件</a-checkbox>
      </div>
    </template>

    <!-- 标签 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.LABEL">
      <div class="style-config-section">
        <div class="style-config-label">标签文本</div>
        <a-input v-model:value="pendingText" size="small" class="style-config-input" @blur="commitText" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">关联表单元素</div>
        <a-select
          v-model:value="(model as CanvasLabelElement).for"
          size="small"
          class="style-config-select"
          :options="formElementOptions"
          placeholder="选择要绑定的表单元素"
          allow-clear
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { CanvasElementTypeEnum, BUTTON_TYPE_OPTIONS } from '@/constants/home';
import { useCanvasStore } from '@/store/canvas';
import type {
  CanvasInnerElement,
  CanvasButtonElement,
  CanvasParagraphElement,
  CanvasImageElement,
  CanvasLinkElement,
  CanvasInputElement,
  CanvasTextareaElement,
  CanvasRadioElement,
  CanvasCheckboxElement,
  CanvasVideoElement,
  CanvasAudioElement,
  CanvasLabelElement,
} from '@/views/Canvas/types';

defineOptions({
  name: 'SettingConfig',
});

/** 元素数据 */
const model = defineModel<CanvasInnerElement>({ required: true });

const canvasStore = useCanvasStore();

/** 编辑前的 id */
const oldId = ref('');

/** 文本内容编辑的临时值（blur 后才同步到 model，避免输入过程中频繁触发元素尺寸重算） */
const pendingText = ref('');

/** 同步 model 文本到临时值 */
watch(
  () => model.value,
  (el) => {
    if (!el) return;
    if (el.type === CanvasElementTypeEnum.BUTTON) pendingText.value = (el as CanvasButtonElement).text;
    else if (el.type === CanvasElementTypeEnum.PARAGRAPH) pendingText.value = (el as CanvasParagraphElement).text;
    else if (el.type === CanvasElementTypeEnum.LINK) pendingText.value = (el as CanvasLinkElement).text;
    else if (el.type === CanvasElementTypeEnum.LABEL) pendingText.value = (el as CanvasLabelElement).text;
  },
  { immediate: true, deep: true },
);

/** blur 时将临时文本同步到 model */
function commitText() {
  const el = model.value;
  if (!el) return;
  if (el.type === CanvasElementTypeEnum.BUTTON) (el as CanvasButtonElement).text = pendingText.value;
  else if (el.type === CanvasElementTypeEnum.PARAGRAPH) (el as CanvasParagraphElement).text = pendingText.value;
  else if (el.type === CanvasElementTypeEnum.LINK) (el as CanvasLinkElement).text = pendingText.value;
  else if (el.type === CanvasElementTypeEnum.LABEL) (el as CanvasLabelElement).text = pendingText.value;
}

/** id 输入框聚焦时保存原值 */
function handleIdFocus() {
  oldId.value = model.value.id;
}

/** id 输入框失焦时校验唯一性 */
function handleIdBlur(e: FocusEvent) {
  const newId = (e.target as HTMLInputElement).value.trim();
  if (!newId || newId === oldId.value) {
    model.value.id = oldId.value;
    return;
  }
  /** 临时恢复旧 id，检查新 id 是否已被其他元素使用 */
  model.value.id = oldId.value;
  const existing = canvasStore.getElementById(newId);
  if (existing) {
    model.value.id = oldId.value;
    message.warning('该 ID 已被其他元素使用');
  } else {
    model.value.id = newId;
    if (canvasStore.selectedElementId === oldId.value) {
      canvasStore.selectElement(newId);
    }
  }
}

/** 可关联的表单元素类型集合 */
const FORM_ELEMENT_TYPES = [
  CanvasElementTypeEnum.INPUT,
  CanvasElementTypeEnum.TEXTAREA,
  CanvasElementTypeEnum.RADIO,
  CanvasElementTypeEnum.CHECKBOX,
];

/** 递归收集所有表单元素，生成下拉选项 */
const formElementOptions = computed(() => {
  const options: { label: string; value: string }[] = [];
  const collect = (list: CanvasInnerElement[]) => {
    for (const el of list) {
      if (FORM_ELEMENT_TYPES.includes(el.type)) {
        options.push({
          label: `${el.alias || el.type} (#${el.id})`,
          value: el.id,
        });
      }
      if (el.type === CanvasElementTypeEnum.CONTAINER) {
        collect((el as { children: CanvasInnerElement[] }).children);
      }
    }
  };
  collect(canvasStore.root.children);
  return options;
});
</script>

<style scoped lang="less">
@import './style-config.less';
</style>
