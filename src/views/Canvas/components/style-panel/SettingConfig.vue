<!-- ? 元素设置配置面板 -->
<template>
  <div>
    <!-- 元素 ID（纯文本元素在生成代码中无属性，不显示 ID 设置） -->
    <div v-if="model.type !== CanvasElementTypeEnum.TEXT" class="style-config-section">
      <div class="style-config-label">ID</div>
      <me-input
        :model-value="pendingId"
        class="style-config-input"
        @focus="handleIdFocus"
        @input="handleIdInput"
        @blur="handleIdBlur"
      />
    </div>

    <!-- 按钮 -->
    <template v-if="model.type === CanvasElementTypeEnum.BUTTON">
      <div class="style-config-section">
        <div class="style-config-label">按钮文本</div>
        <me-input v-model="(model as CanvasButtonElement).text" class="style-config-input" />
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
        <me-input type="textarea" v-model="(model as CanvasParagraphElement).text" :rows="3" />
      </div>
    </template>

    <!-- 图片 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.IMAGE">
      <div class="style-config-section">
        <div class="style-config-label">图片地址</div>
        <me-input v-model="pendingSrc" class="style-config-input" placeholder="https://" @blur="handleSrcBlur" />
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
        <me-input v-model="pendingHref" class="style-config-input" placeholder="https://" @blur="handleHrefBlur" />
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
        <a-input-number v-model:value="(model as CanvasTextareaElement).rows" class="style-config-input-number" :min="1" :precision="0" />
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
        <me-input v-model="pendingSrc" class="style-config-input" placeholder="https://" @blur="handleSrcBlur" />
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasVideoElement).controls">显示控件</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasVideoElement).autoplay">自动播放</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasVideoElement).muted">静音</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasVideoElement).loop">循环播放</me-checkbox>
      </div>
    </template>

    <!-- 音频 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.AUDIO">
      <div class="style-config-section">
        <div class="style-config-label">音频地址</div>
        <me-input v-model="pendingSrc" class="style-config-input" placeholder="https://" @blur="handleSrcBlur" />
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasAudioElement).controls">显示控件</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasAudioElement).autoplay">自动播放</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasAudioElement).muted">静音</me-checkbox>
      </div>
      <div class="style-config-section">
        <me-checkbox v-model="(model as CanvasAudioElement).loop">循环播放</me-checkbox>
      </div>
    </template>

    <!-- 标签 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.LABEL">
      <div class="style-config-section">
        <div class="style-config-label">标签文本</div>
        <me-input v-model="(model as CanvasLabelElement).text" class="style-config-input" />
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
        <me-input v-model="pendingAction" class="style-config-input" placeholder="https://" @blur="handleActionBlur" />
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
        <me-input v-model="(model as CanvasHeadingElement).text" class="style-config-input" />
      </div>
      <div class="style-config-section">
        <div class="style-config-label">标题级别</div>
        <me-select v-model="(model as CanvasHeadingElement).level" class="style-config-select" :options="HEADING_LEVEL_OPTIONS" />
      </div>
    </template>

    <!-- 通用元素 -->
    <!-- 标签名编辑已停用：允许改名会导致与专用元素类型（如 audio/video）能力割裂且逻辑重复，如需还原请同步恢复 script 中 pendingTagName/commitTagName 及相关 import -->
    <!-- <template v-else-if="model.type === CanvasElementTypeEnum.GENERAL">
      <div class="style-config-section">
        <div class="style-config-label">标签名</div>
        <me-input v-model="pendingTagName" class="style-config-input" @blur="commitTagName" />
      </div>
    </template> -->

    <!-- 纯文本 -->
    <template v-else-if="model.type === CanvasElementTypeEnum.TEXT">
      <div class="style-config-section">
        <div class="style-config-label">文本内容</div>
        <me-input type="textarea" v-model="(model as CanvasTextElement).text" :rows="3" />
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
import { isSafeUrl, sanitizeNavigationUrl } from '@/utils/sanitize';
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
  isParentElement,
} from '@/views/Canvas/types';

defineOptions({
  name: 'SettingConfig',
});

/** 元素数据 */
const model = defineModel<CanvasInnerElement>({ required: true });

const canvasStore = useCanvasStore();

/** id 输入框当前值（blur 校验通过后才同步到 model.id） */
const pendingId = ref('');

/** 媒体资源地址编辑的临时值（blur 后才同步到 model.src，避免每输入一个字符就触发一次资源请求） */
const pendingSrc = ref('');

/** 链接地址编辑的临时值（blur 后才同步到 model.href） */
const pendingHref = ref('');

/** 表单提交地址编辑的临时值（blur 后才同步到 model.action） */
const pendingAction = ref('');

// 通用元素标签名编辑的临时值（blur 校验后才同步到 model）——标签名编辑已停用，保留注释便于还原
// const pendingTagName = ref('');

/** 同步元素 id 到输入框临时值（仅跟随 id 变化，避免编辑期间被其他属性变更重置） */
watch(
  () => model.value?.id,
  (id) => {
    if (id) pendingId.value = id;
  },
  { immediate: true },
);

/** 同步 model 的 URL 类属性到临时值 */
watch(
  () => model.value,
  (el) => {
    if (!el) return;
    if (el.type === CanvasElementTypeEnum.IMAGE) pendingSrc.value = (el as CanvasImageElement).src;
    else if (el.type === CanvasElementTypeEnum.VIDEO) pendingSrc.value = (el as CanvasVideoElement).src;
    else if (el.type === CanvasElementTypeEnum.AUDIO) pendingSrc.value = (el as CanvasAudioElement).src;
    else if (el.type === CanvasElementTypeEnum.LINK) pendingHref.value = (el as CanvasLinkElement).href;
    else if (el.type === CanvasElementTypeEnum.FORM) pendingAction.value = (el as CanvasFormElement).action;
    // 标签名编辑已停用，还原时恢复以下同步逻辑
    // if (el.type === CanvasElementTypeEnum.GENERAL) pendingTagName.value = (el as CanvasGeneralElement).tagName;
  },
  { immediate: true, deep: true },
);

// 标签名编辑已停用
// /** blur 时将临时标签名同步到 model（非法值回退并提示） */
// function commitTagName() {
//   const el = model.value;
//   if (!el || el.type !== CanvasElementTypeEnum.GENERAL) return;
//   const tagName = pendingTagName.value.trim().toLowerCase();
//   if (!tagName || tagName === (el as CanvasGeneralElement).tagName) {
//     pendingTagName.value = (el as CanvasGeneralElement).tagName;
//     return;
//   }
//   // 禁用危险标签与原始文本标签
//   if (!isAllowedTagName(tagName)) {
//     pendingTagName.value = (el as CanvasGeneralElement).tagName;
//     message.warning('标签名不合法或不允许使用');
//     return;
//   }
//   const generalEl = el as CanvasGeneralElement;
//   // 目标标签为自闭合元素且当前存在子节点时拒绝改名，避免子元素在生成时被静默丢弃
//   if (isVoidElement(tagName) && generalEl.children.length > 0) {
//     pendingTagName.value = generalEl.tagName;
//     message.warning('目标标签不允许包含子元素');
//     return;
//   }
//   // 目标标签存在结构约束时，逐个校验现有子元素子树是否仍被允许，避免改名后生成非法嵌套结构
//   const renamed = { ...generalEl, tagName };
//   if (generalEl.children.some((child) => !isSubtreeAllowed(renamed, child))) {
//     pendingTagName.value = generalEl.tagName;
//     message.warning('目标标签不允许包含当前子元素');
//     return;
//   }
//   // 别名仍为旧标签名（解析入库时自动生成）时同步更新，保证图层显示跟随新标签名
//   if (generalEl.alias === generalEl.tagName) {
//     generalEl.alias = tagName;
//   }
//   generalEl.tagName = tagName;
// }

/** id 输入框聚焦时重置为当前 id */
function handleIdFocus() {
  pendingId.value = model.value.id;
}

/** id 输入框输入时同步到 pendingId */
function handleIdInput(value: string) {
  pendingId.value = value;
}

/** id 输入框失焦时校验格式与唯一性 */
function handleIdBlur() {
  const oldId = model.value.id;
  const newId = pendingId.value.trim();
  if (newId === oldId) return;
  /** 校验未通过时还原显示为旧 id */
  if (!newId || !CSS_NAME_REGEX.test(newId)) {
    pendingId.value = oldId;
    if (newId) message.warning('ID 名称格式不合法');
    return;
  }
  /** 唯一性校验 */
  if (canvasStore.getElementById(newId)) {
    pendingId.value = oldId;
    message.warning('该 ID 已被其他元素使用');
    return;
  }
  model.value.id = newId;
  pendingId.value = newId;
  /** 同步重命名 #id 样式规则及 label 的 for 引用，避免引用失配 */
  canvasStore.renameElementId(oldId, newId);
  if (canvasStore.selectedElementId === oldId) {
    canvasStore.selectElement(newId);
  }
}

/** 链接地址失焦时校验协议安全性并同步到 model */
function handleHrefBlur() {
  const el = model.value as CanvasLinkElement;
  if (!el || el.type !== CanvasElementTypeEnum.LINK) return;
  const href = pendingHref.value.trim();
  /** 校验未通过时还原显示为旧地址（导航语境不放行 data:） */
  if (href && !sanitizeNavigationUrl(href)) {
    pendingHref.value = el.href;
    message.warning('链接地址协议不安全，仅支持 http、https、mailto、tel 及相对路径，不支持 data: 地址');
    return;
  }
  el.href = href;
  pendingHref.value = href;
}

/** 表单提交地址失焦时校验协议安全性并同步到 model */
function handleActionBlur() {
  const el = model.value as CanvasFormElement;
  if (!el || el.type !== CanvasElementTypeEnum.FORM) return;
  const action = pendingAction.value.trim();
  /** 校验未通过时还原显示为旧地址（导航语境不放行 data:） */
  if (action && !sanitizeNavigationUrl(action)) {
    pendingAction.value = el.action;
    message.warning('提交地址协议不安全，仅支持 http、https、mailto、tel 及相对路径，不支持 data: 地址');
    return;
  }
  el.action = action;
  pendingAction.value = action;
}

/** 媒体资源地址失焦时校验协议安全性并同步到 model（Image/Video/Audio） */
function handleSrcBlur() {
  const el = model.value as CanvasImageElement | CanvasVideoElement | CanvasAudioElement;
  if (!el) return;
  const src = pendingSrc.value.trim();
  /** 校验未通过时还原显示为旧地址 */
  if (src && !isSafeUrl(src)) {
    pendingSrc.value = el.src;
    message.warning('资源地址协议不安全，仅支持 http、https、相对路径及图片/音频/视频/字体类 data: 地址');
    return;
  }
  el.src = src;
  pendingSrc.value = src;
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
