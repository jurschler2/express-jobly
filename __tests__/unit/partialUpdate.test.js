const sqlForPartialUpdate = require("../../helpers/partialUpdate")

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
      function () {

        let table = "jobs";
        let items = {"industry": "healthcare"};
        let key = "industry_code";
        let id = 2;

        expect(sqlForPartialUpdate(table, items, key, id)).toEqual({query: `UPDATE jobs SET industry=$1 WHERE industry_code=$2 RETURNING *`, values: ['healthcare', 2]})

  });
  
  it("should generate a proper partial update query with 2 fields",
      function () {

        let table = "jobs";
        let items = {"industry": "technology", "experience": "new-hire"};
        let key = "industry_code";
        let id = 1;

        expect(sqlForPartialUpdate(table, items, key, id)).toEqual({query: `UPDATE jobs SET industry=$1, experience=$2 WHERE industry_code=$3 RETURNING *`, values: ['technology', 'new-hire', 1]})

  });
});
