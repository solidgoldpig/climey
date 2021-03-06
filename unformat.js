const formatDate = (person, field) => {
  return 'date' + field
}

const getAnswer = (assessments, field) => {
  return assessments.filter(assessment => {
    return assessment.key === field
  })[0]
}

const mapMethods = {}

mapMethods.identifier = (person, field) => {
  const identifiers = person.identifiers || []
  const identifier = identifiers.filter(
    identifier => identifier.identifier_type === field
  )[0]
  if (identifier) {
    return identifier.value
  }
}

mapMethods.relationship = (person, field) => {
  const relationship = person[field]
  if (relationship) {
    return relationship.id
  }
}

mapMethods.date = (person, field) => {
  const fieldValue = person[field]
  if (fieldValue) {
    return formatDate(fieldValue)
  }
}

const getAssessments = person => {
  return person.assessment_answers || []
}

mapMethods.explicitAssessment = (person, field, assessmentCategories) => {
  let value
  const assessments = getAssessments(person)
  const matchedAnswer = getAnswer(assessments, field)
  const explicitKey = `${field}__explicit`

  if (matchedAnswer) {
    const questionId = matchedAnswer.assessment_question_id
    value = matchedAnswer.comments
    assessmentCategories[explicitKey] = questionId
  } else {
    assessmentCategories[explicitKey] = 'false'
  }
  return value
}

mapMethods.assessment = (person, field, assessmentCategories) => {
  let value
  const assessments = getAssessments(person)
  const matchedAnswer = getAnswer(assessments, field)

  if (matchedAnswer) {
    const questionId = matchedAnswer.assessment_question_id
    value = matchedAnswer.comments
    const category = matchedAnswer.category
    assessmentCategories[category] = assessmentCategories[category] || []
    assessmentCategories[category].push(questionId)
  }
  return value
}

mapMethods.value = (person, field) => person[field]

const mapKeys = Object.keys(mapMethods)
const unformat = (person, fields = [], fieldKeys = {}) => {
  const assessmentCategories = {}

  const fieldData = fields.map(field => {
    const method = mapKeys.filter(key => fieldKeys[key].includes(field))[0] || 'value'
    const value = mapMethods(method)(person, field, assessmentCategories)
    return { [field]: value }
  })
  return Object.assign({}, ...fieldData, assessmentCategories)
}

module.exports = unformat
