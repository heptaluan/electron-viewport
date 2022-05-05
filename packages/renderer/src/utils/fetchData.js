/**
 * Created by 9I
 * @Date 2022/2/17
 * @description
 */
import { queryPromise }  from './sqlLite.js'

// export const getUploadData = () => {
//   const sql = 'select * from dicom_patient'
//   db.run(sql)
//   const data = db.export()
//   console.log(data)
//   return data
// }

export const getUploadData = async (sql)=>{
  sql = 'select * from dicom_patient'
  const result = await queryPromise(sql)
  const data = [...result]
  return data
}
