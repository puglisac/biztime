## Biztime

Biztime is a REST-ful backend API server for a simple company/invoice tracker.

## Endpoints:

### Companies: 
- GET /companies  

	Returns list of companies, like:  
	{companies: [{code, name}, ...]}  

 GET /companies/[code]
Return obj of company: {company: {code, name, description}}


- POST /companies  

 Adds a company.

 Needs to be given JSON like:  
 {code, name, description}

 Returns obj of new company:  
 {company: {code, name, description}}

- PUT /companies/[code]  
Edit existing company.

 Needs to be given JSON like:  
 {name, description}

 Returns update company object:  
 {company: {code, name, description}}

- DELETE /companies/[code]  
 Deletes company.

 Returns:  
 {status: "deleted"}
 
- GET /companies/[code]  
 
 Return obj of company:  
 {company: {code, name, description, invoices: [id, ...]}}
 
### Invoices: 
- GET /invoices  
 
 Return info on invoices like:  
{invoices: [{id, comp_code}, ...]}  

- GET /invoices/[id]
 Returns obj on given invoice.

 Returns:  
{invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}

- POST /invoices  
Adds an invoice.

 Needs to be passed in JSON body of:  
 {comp_code, amt}

 Returns:  
 {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

- PUT /invoices/[id]  

 Updates an invoice.  

 Needs to be passed in a JSON body of {amt}

 Returns:  
 {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

- DELETE /invoices/[id]
 Deletes an invoice.

 Returns:  
  {status: "deleted"}



## Built Using:

NodeJS - backend  
PostgreSQL - database  
Node-pg - ORM for database  
Jest - testing