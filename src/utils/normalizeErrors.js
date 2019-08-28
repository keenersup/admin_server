export const normalizeErrors = (errors) => {
  if (errors.isJoi) {
    return errors.details.reduce((acc, cv) => {
      acc[`${cv.path[0]}`] = cv.message
      return acc
    }, {})
  }
  if (errors.hasOwnProperty('errors')) {
    let err = {}
    Object.keys(errors.errors).forEach(key => {
      err[`${errors.errors[key].path}`] = errors.errors[key].message
    })
    return err
  }
  return errors
}