const formatDate = (person, field) => {
  return 'date' + field
}

const getAnswer = (assessments, field) => {
  return assessments.filter(assessment => {
    return assessment.key === field
  })[0]
}

const mapIdentifier = (person, field) => {
  const identifiers = person.identifiers || []
  const identifier = identifiers.filter(
    identifier => identifier.identifier_type === field
  )[0]
  if (identifier) {
    return identifier.value
  }
}

const mapRelationship = (person, field) => {
  const relationship = person[field]
  if (relationship) {
    return relationship.id
  }
}

const mapDate = (person, field) => {
  const fieldValue = person[field]
  if (fieldValue) {
    return formatDate(fieldValue)
  }
}

const getAssessments = person => {
  return person.assessment_answers || []
}

const mapExplicitAssessment = (person, field, assessmentCategories) => {
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

const mapAssessment = (person, field, assessmentCategories) => {
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

const unformat = (
  person,
  fields = [],
  identifierKeys = [],
  relationshipKeys = [],
  dateKeys = [],
  explicitAssessmentKeys = [],
  assessmentKeys = [],
) => {
  const assessmentCategories = {}

  const fieldData = fields.map(field => {
    let value
    if (identifierKeys.includes(field)) {
      value = mapIdentifier(person, field)
    } else if (relationshipKeys.includes(field)) {
      value = mapRelationship(person, field)
    } else if (dateKeys.includes(field)) {
      value = mapDate(person, field)
    } else if (explicitAssessmentKeys.includes(field)) {
      value = mapExplicitAssessment(person, field, assessmentCategories)
    } else if (assessmentKeys.includes(field)) {
      value = mapAssessment(person, field, assessmentCategories)
    } else {
      value = person[field]
    }
    return { [field]: value }
  })
  return Object.assign({}, ...fieldData, assessmentCategories)
}

module.exports = unformat
