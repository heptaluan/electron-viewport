<template>
  <div class="dicom-view page-main">
    <a-layout class="layout b-flex flex-col">
      <a-layout-content class="layout-content">
        <div class="main-content b-flex flex-col">
          <div class="tool-bar">
            <div class="action-tool b-flex">
              <div class="text-center">
                <a-button>批量删除</a-button>
              </div>
              <div class="flex-1 text-right">
                <select-dir-btn @select-path="readDir"></select-dir-btn>
                <a-button @click="handleImport()">导入dicom文件</a-button>
                <a-button>导出未通过质检</a-button>
                <a-button>打开文件目录</a-button>
              </div>
            </div>
            <div class="seach-tool b-flex margin-top-sm">
              <div class="flex-1 b-flex">
                <div class="seach-item b-flex flex-align-center">
                  <label class="margin-right-xs">病例Id:</label>
                  <div class="flex-1 margin-left-xs">
                    <a-input v-model="searchParams.patientId"></a-input>
                  </div>
                </div>
                <div class="seach-item b-flex flex-align-center margin-left-sm">
                  <label class="margin-right-xs">姓名:</label>
                  <div class="flex-1 margin-left-xs">
                    <a-input v-model="searchParams.name"></a-input>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <a-button >查询</a-button>
                <a-button >重置</a-button>
              </div>
            </div>
          </div>
          <div class="data-content flex-1 margin-top-sm">
            <a-table :columns="columns" :data-source="data" size="small" rowKey="id">
              <a slot="name" slot-scope="text">{{ text }}</a>
              <span slot="customTitle"><a-icon type="smile-o" /> Name</span>
              <span slot="tags" slot-scope="tags">
                <a-tag
                    v-for="tag in tags"
                    :key="tag"
                    :color="tag === 'loser' ? 'volcano' : tag.length > 5 ? 'geekblue' : 'green'"
                >
                  {{ tag.toUpperCase() }}
                </a-tag>
              </span>
              <span slot="action" slot-scope="text, record">
                <a>Invite 一 {{ record.name }}</a>
                <a-divider type="vertical" />
                <a>Delete</a>
                <a-divider type="vertical" />
                <a class="ant-dropdown-link"> More actions <a-icon type="down" /> </a>
              </span>
            </a-table>
          </div>
        </div>
      </a-layout-content>
      <a-layout-footer>
        <div class="footer-status b-flex">
          <div class="flex-1">
            准备就绪
          </div>
          <div class="flex-1">
            <a-progress :percent="percent" size="small" />
          </div>
        </div>
      </a-layout-footer>
    </a-layout>
    <a-modal v-model:visible="visible" title="文件列表" @ok="handleOk" class="upload-filelist" width="600px">
      <div class="data-panel">
        <a-table :columns="fileColumns" :data-source="fileDataList" size="small" rowKey="id" :pagination="pagination">
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script>
  import { defineComponent, toRaw } from 'vue';
  // import { getUploadData } from '../utils/fetchData'
  import SelectDirBtn from '../components/SelectDirBtn.vue'
  import { message } from 'ant-design-vue';
  const dicomParser = window.dicomParser

  const columns = [
    {
      title: '姓名',
      dataIndex: 'patient_name',
      key: 'patientName',
    },
    {
      title: '病人ID',
      dataIndex: 'patient_id',
      key: 'patient_id',
    },
    {
      title: '年龄',
      dataIndex: 'patient_age',
      key: 'age',
    },
    {
      title: '出生年月',
      dataIndex: 'patient_birthdate',
      key: 'birthDate',
    },
    {
      title: '性别',
      dataIndex: 'patient_sex',
      key: 'sex',
    },
    {
      title: '扫描日期',
      dataIndex: 'detection_time',
      key: 'RealTime',
    },
    {
      title: '上传人',
      key: 'upload_by',
      dataIndex: 'upload_by',
      // scopedSlots: { customRender: 'tags' },
    },
    {
      title: '操作',
      key: 'action',
      scopedSlots: { customRender: 'action' },
    },
  ];

  export default defineComponent({
    name: 'MainContent',
    components: {
      SelectDirBtn
    },
    data () {
      return {
        percent: 30,
        columns,
        data: [],
        searchParams: {
          patientId: '',
          name: ''
        },
        fileList: [],
        visible: false,
        fileColumns: [
          {
            title: '文件名',
            dataIndex: 'name',
          },
          {
            title: '路径',
            dataIndex: 'path',
          },
          {
            title: '格式',
            dataIndex: 'type',
          },
          {
            title: '大小',
            dataIndex: 'size',
          }
        ],
        fileDataList: [],
        pagination: {
          pageSize: 1000
        }
      }
    },
    setup() {
    },
    mounted () {
      // this.getData()
    },
    methods: {
      async getData() {
        const data = await getUploadData()
        this.data = toRaw(data)
      },
      handleImport () {

      },
      readDir(fileList) {
        this.fileList = fileList
        this.visible = true
        this.fileDataList = []
        for (let i = 0; i < fileList.length; i++) {
          const {name, path, size, webkitRelativePath, type} = fileList[i]
          const _type = type ? type : this.getType(name)
          if (!_type || _type.toUpperCase() === 'DCM') {
            this.fileDataList.push({
              id: 'file' + i,
              name,
              path,
              size: (size / 1024).toFixed(1) + 'K',
              webkitRelativePath,
              type: _type
            })
          }
        }
        // message.info(`共读取到${fileList.length}个文件`)
      },
      handleOk () {
        this.visible = false
        this.readFileInfo(this.fileDataList[0])
      },
      readFileInfo (file) {
        const path = file.path
        try {
          // read file sync
          const dicomFileAsBuffer = fs.readFileSync(path);
          // Allow raw files
          const options = { TransferSyntaxUID: '1.2.840.10008.1.2' }
          // Parse the byte array to get a DataSet object that has the parsed contents
          const dataSet = dicomParser.parseDicom(dicomFileAsBuffer, options)
          // access a string element
          const studyInstanceUid = dataSet.string('x0020000d')
          // get the pixel data element (contains the offset and length of the data)
          const pixelDataElement = dataSet.elements.x7fe00010

        } catch (ex) {
          console.log('Error parsing byte stream', ex)
        }
      },
      getType (fileName) {
        let fileType = ''
        if (fileName.indexOf('.') > -1) {
          fileType = fileName.split('.')[1]
        }
        return fileType
      }
    }
  })
</script>
