<!-- ? 元素设置配置面板 -->
<template>
  <div>
    <!-- 元素 ID（纯文本元素在生成代码中无属性，不显示 ID 设置） -->
    <div v-if="model.type !== CanvasElementTypeEnum.TEXT" class="style-config-section">
      <div class="style-config-label">ID</div>
      <me-input
        :model-value="model.id"
        class="style-config-input"
        @focus="handleIdFocus"
        @input="handleIdInput"
        @blur="handleIdBlur"
      />
      <div v-if="pendingId && !isIdNameValid" class="style-config-error">
        ID 名称须以字母、下划线开头，仅包含字母、数字、下划线和短横线
      </div>
    </div>

    <!-- 按钮 -->
    <template v-if="model.type === CanvasElementTypeEnum.BUTTON">
      <div class="style-config-section">
        <div class="style-config-label">按钮文本</div>
        <me-input v-model="pendingText" class="style-config-input" @blur="commitText" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">按钮类型</div>
        <me-select v-model="(model as CanvasButtonElement).buttonType" class="style-config-select" :options="BUTTON_TYPE_OPTIONS" clearable />
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasButtonElement).disabled">禁用</me-checkbox>
      </div>
    </template>

    <!-- 段落 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.PARAGRAPH">
      <div class="style-config-section">
        <div class="style-config-label">段落文本</div>
        <me-input type="textarea" v-model="pendingText" :rows="3" @blur="commitText" />
      </div>
    </template>

    <!-- 图片 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.IMAGE">
      <div class="style-config-section">
        <div class="style-config-label">图片地址</div>
        <me-input v-model="(model as CanvasImageElement).src" class="style-config-input" placeholder="https://" @blur="handleSrcBlur" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">图片标题</div>
        <me-input v-model="(model as CanvasImageElement).title" class="style-config-input" />
      </div>
    </template>

    <!-- 超链接 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.LINK">
      <div class="style-config-section">
        <div class="style-config-label">链接地址</div>
        <me-input v-model="(model as CanvasLinkElement).href" class="style-config-input" placeholder="https://" @blur="handleHrefBlur" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">打开方式</div>
        <me-select v-model="(model as CanvasLinkElement).target" class="style-config-select" :options="LINK_TARGET_OPTIONS" clearable />
      </div>
    </template>

    <!-- 单行文本框 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.INPUT">
      <div class="style-config-section">
        <div class="style-config-label">占位提示</div>
        <me-input v-model="(model as CanvasInputElement).placeholder" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">默认值</div>
        <me-input v-model="(model as CanvasInputElement).value" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasInputElement).required">必填</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasInputElement).disabled">禁用</me-checkbox>
      </div>
    </template>

    <!-- 多行文本框 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.TEXTAREA">
      <div class="style-config-section">
        <div class="style-config-label">占位提示</div>
        <me-input v-model="(model as CanvasTextareaElement).placeholder" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">默认值</div>
        <me-input v-model="(model as CanvasTextareaElement).value" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">行数</div>
        <a-input-number v-model:value="(model as CanvasTextareaElement).rows" class="style-config-input-number" :min="1" />
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasTextareaElement).required">必填</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasTextareaElement).disabled">禁用</me-checkbox>
      </div>
    </template>

    <!-- 单选框 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.RADIO">
      <div class="style-config-section">
        <div class="style-config-label">单选组名称</div>
        <me-input v-model="(model as CanvasRadioElement).name" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">选项值</div>
        <me-input v-model="(model as CanvasRadioElement).value" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasRadioElement).checked">默认选中</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasRadioElement).required">必填</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasRadioElement).disabled">禁用</me-checkbox>
      </div>
    </template>

    <!-- 多选框 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.CHECKBOX">
      <div class="style-config-section">
        <div class="style-config-label">多选组名称</div>
        <me-input v-model="(model as CanvasCheckboxElement).name" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">选项值</div>
        <me-input v-model="(model as CanvasCheckboxElement).value" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasCheckboxElement).checked">默认选中</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasCheckboxElement).required">必填</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasCheckboxElement).disabled">禁用</me-checkbox>
      </div>
    </template>

    <!-- 视频 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.VIDEO">
      <div class="style-config-section">
        <div class="style-config-label">视频地址</div>
        <me-input v-model="(model as CanvasVideoElement).src" class="style-config-input" placeholder="https://" @blur="handleSrcBlur" />
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasVideoElement).controls">显示控件</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasVideoElement).autoplay">自动播放</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasVideoElement).loop">循环播放</me-checkbox>
      </div>
    </template>

    <!-- 音频 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.AUDIO">
      <div class="style-config-section">
        <div class="style-config-label">音频地址</div>
        <me-input v-model="(model as CanvasAudioElement).src" class="style-config-input" placeholder="https://" @blur="handleSrcBlur" />
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasAudioElement).controls">显示控件</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasAudioElement).autoplay">自动播放</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasAudioElement).loop">循环播放</me-checkbox>
      </div>
    </template>

    <!-- 标签 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.LABEL">
      <div class="style-config-section">
        <div class="style-config-label">标签文本</div>
        <me-input v-model="pendingText" class="style-config-input" @blur="commitText" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">关联表单元素</div>
        <me-select
          v-model="(model as CanvasLabelElement).for"
          class="style-config-select"
          :options="formElementOptions"
          placeholder="选择要绑定的表单元素"
          clearable
        />
      </div>
    </template>

    <!-- 表单 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.FORM">
      <div class="style-config-section">
        <div class="style-config-label">提交地址</div>
        <me-input v-model="(model as CanvasFormElement).action" class="style-config-input" placeholder="https://" @blur="handleActionBlur" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">提交方式</div>
        <me-select v-model="(model as CanvasFormElement).method" class="style-config-select" :options="FORM_METHOD_OPTIONS" clearable />
      </div>
    </template>

    <!-- 标题 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.HEADING">
      <div class="style-config-section">
        <div class="style-config-label">标题文本</div>
        <me-input v-model="pendingText" class="style-config-input" @blur="commitText" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">标题级别</div>
        <me-select v-model="(model as CanvasHeadingElement).level" class="style-config-select" :options="HEADING_LEVEL_OPTIONS" />
      </div>
    </template>

    <!-- 通用元素 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.GENERAL">
      <div class="style-config-section">
        <div class="style-config-label">标签名</div>
        <me-input v-model="pendingTagName" class="style-config-input" @blur="commitTagName" />
      </div>
    </template>

    <!-- 纯文本 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.TEXT">
      <div class="style-config-section">
        <div class="style-config-label">文本内容</div>
        <me-input type="textarea" v-model="pendingText" :rows="3" @blur="commitText" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { MeCheckbox, MeInput, MeSelect } from '@zyf_dsb/me-ui';
import { CanvasElementTypeEnum, BUTTON_TYPE_OPTIONS, LINK_TARGET_OPTIONS, FORM_ELEMENT_TYPES, FORM_METHOD_OPTIONS, HEADING_LEVEL_OPTIONS } from '@/constants/home';
import { CSS_NAME_REGEX } from '@/constants/style';
import { useCanvasStore } from '@/store/canvas';
import { isSafeUrl } from '@/utils/sanitize';
import {
  type CanvasInnerElement,
  type CanvasButtonElement,
  type CanvasParagraphElement,
  type CanvasImageElement,
  type CanvasLinkElement,
  type CanvasInputElement,
  type CanvasTextareaElement,
  type CanvasRadioElement,
  type CanvasCheckboxElement,
  type CanvasVideoElement,
  type CanvasAudioElement,
  type CanvasLabelElement,
  type CanvasFormElement,
  type CanvasTextElement,
  type CanvasHeadingElement,
  type CanvasGeneralElement,
  isParentElement,
  isSubtreeAllowed,
} from '@/views/Canvas/types';
import { isAllowedTagName, isVoidElement } from '@/utils/html-parser';

defineOptions({
  name: 'SettingConfig',
});

/** 元素数据 */
const model = defineModel<CanvasInnerElement>({ required: true });

const canvasStore = useCanvasStore();

/** 编辑前的 id */
const oldId = ref('');

/** id 输入框当前值（用于实时校验显示） */
const pendingId = ref('');

/** id 名称是否合法 */
const isIdNameValid = computed(() => CSS_NAME_REGEX.test(pendingId.value.trim()));

/** 文本内容编辑的临时值（blur 后才同步到 model，避免输入过程中频繁触发元素尺寸重算） */
const pendingText = ref('');

/** 通用元素标签名编辑的临时值（blur 校验后才同步到 model） */
const pendingTagName = ref('');

/** 同步 model 文本到临时值 */
watch(
  () => model.value,
  (el) => {
    if (!el) return;
    pendingId.value = '';
    if (el.type === CanvasElementTypeEnum.BUTTON) pendingText.value = (el as CanvasButtonElement).text;
    else if (el.type === CanvasElementTypeEnum.PARAGRAPH) pendingText.value = (el as CanvasParagraphElement).text;
    else if (el.type === CanvasElementTypeEnum.LABEL) pendingText.value = (el as CanvasLabelElement).text;
    else if (el.type === CanvasElementTypeEnum.HEADING) pendingText.value = (el as CanvasHeadingElement).text;
    else if (el.type === CanvasElementTypeEnum.TEXT) pendingText.value = (el as CanvasTextElement).text;
    if (el.type === CanvasElementTypeEnum.GENERAL) pendingTagName.value = (el as CanvasGeneralElement).tagName;
  },
  { immediate: true, deep: true },
);

/** blur 时将临时文本同步到 model */
function commitText() {
  const el = model.value;
  if (!el) return;
  if (el.type === CanvasElementTypeEnum.BUTTON) (el as CanvasButtonElement).text = pendingText.value;
  else if (el.type === CanvasElementTypeEnum.PARAGRAPH) (el as CanvasParagraphElement).text = pendingText.value;
  else if (el.type === CanvasElementTypeEnum.LABEL) (el as CanvasLabelElement).text = pendingText.value;
  else if (el.type === CanvasElementTypeEnum.HEADING) (el as CanvasHeadingElement).text = pendingText.value;
  else if (el.type === CanvasElementTypeEnum.TEXT) (el as CanvasTextElement).text = pendingText.value;
}

/** blur 时将临时标签名同步到 model（非法值回退并提示） */
function commitTagName() {
  const el = model.value;
  if (!el || el.type !== CanvasElementTypeEnum.GENERAL) return;
  const tagName = pendingTagName.value.trim().toLowerCase();
  if (!tagName || tagName === (el as CanvasGeneralElement).tagName) {
    pendingTagName.value = (el as CanvasGeneralElement).tagName;
    return;
  }
  // 禁用危险标签与原始文本标签
  if (!isAllowedTagName(tagName)) {
    pendingTagName.value = (el as CanvasGeneralElement).tagName;
    message.warning('标签名不合法或不允许使用');
    return;
  }
  const generalEl = el as CanvasGeneralElement;
  // 目标标签为自闭合元素且当前存在子节点时拒绝改名，避免子元素在生成时被静默丢弃
  if (isVoidElement(tagName) && generalEl.children.length > 0) {
    pendingTagName.value = generalEl.tagName;
    message.warning('目标标签不允许包含子元素');
    return;
  }
  // 目标标签存在结构约束时，逐个校验现有子元素子树是否仍被允许，避免改名后生成非法嵌套结构
  const renamed = { ...generalEl, tagName };
  if (generalEl.children.some((child) => !isSubtreeAllowed(renamed, child))) {
    pendingTagName.value = generalEl.tagName;
    message.warning('目标标签不允许包含当前子元素');
    return;
  }
  // 别名仍为旧标签名（解析入库时自动生成）时同步更新，保证图层显示跟随新标签名
  if (generalEl.alias === generalEl.tagName) {
    generalEl.alias = tagName;
  }
  generalEl.tagName = tagName;
}

/** id 输入框聚焦时保存原值 */
function handleIdFocus() {
  oldId.value = model.value.id;
  pendingId.value = model.value.id;
}

/** id 输入框输入时同步到 pendingId */
function handleIdInput(value: string) {
  pendingId.value = value;
}

/** id 输入框失焦时校验格式与唯一性 */
function handleIdBlur(e: FocusEvent) {
  const newId = (e.target as HTMLInputElement).value.trim();
  pendingId.value = '';
  if (!newId || newId === oldId.value) {
    model.value.id = oldId.value;
    return;
  }
  /** 格式校验 */
  if (!CSS_NAME_REGEX.test(newId)) {
    model.value.id = oldId.value;
    message.warning('ID 名称格式不合法');
    return;
  }
  /** 临时恢复旧 id，检查新 id 是否已被其他元素使用 */
  model.value.id = oldId.value;
  const existing = canvasStore.getElementById(newId);
  if (existing) {
    message.warning('该 ID 已被其他元素使用');
  } else {
    model.value.id = newId;
    /** 同步重命名 #id 样式规则，避免规则失配导致元素样式丢失 */
    canvasStore.renameElementIdRules(oldId.value, newId);
    if (canvasStore.selectedElementId === oldId.value) {
      canvasStore.selectElement(newId);
    }
  }
}

/** 链接地址失焦时校验协议安全性 */
function handleHrefBlur() {
  const el = model.value as CanvasLinkElement;
  if (!el || el.type !== CanvasElementTypeEnum.LINK) return;
  const href = el.href?.trim() ?? '';
  if (!href) return;
  if (!isSafeUrl(href)) {
    el.href = '';
    message.warning('链接地址协议不安全，仅支持 http、https、mailto、tel 及相对路径');
    return;
  }
  el.href = href;
}

/** 表单提交地址失焦时校验协议安全性 */
function handleActionBlur() {
  const el = model.value as CanvasFormElement;
  if (!el || el.type !== CanvasElementTypeEnum.FORM) return;
  const action = el.action?.trim() ?? '';
  if (!action) return;
  if (!isSafeUrl(action)) {
    el.action = '';
    message.warning('提交地址协议不安全，仅支持 http、https、mailto、tel 及相对路径');
    return;
  }
  el.action = action;
}

/** 媒体资源地址失焦时校验协议安全性（Image/Video/Audio） */
function handleSrcBlur() {
  const el = model.value as CanvasImageElement | CanvasVideoElement | CanvasAudioElement;
  if (!el) return;
  const src = el.src?.trim() ?? '';
  if (!src) return;
  if (!isSafeUrl(src)) {
    el.src = '';
    message.warning('资源地址协议不安全，仅支持 http、https、mailto、tel 及相对路径');
    return;
  }
  el.src = src;
}

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
      if (isParentElement(el)) {
        collect(el.children);
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
