const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('../index');
const Note = require('../models/Note');
const { expect } = chai;

chai.use(chaiHttp);

// create note
describe('POST /note - Create a Note', () => {
  it('should create a new note with valid data', async () => {
    const noteData = {
      title: 'Test Note',
      description: 'This is a test note',
      tag: 'test',
      userId: '1234567890',
    };

    const createNoteStub = sinon.stub(Note, 'create').resolves({
      _id: 'mockedNoteId',
      ...noteData,
    });

    const res = await chai.request(app).post('/api/v1/notes').send(noteData);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('note');
    expect(createNoteStub.calledOnce).to.be.true;

    createNoteStub.restore();
  });

  it('should return an error if note creation fails', async () => {
    const noteData = {
      title: 'Test Note',
      description: 'This is a test note',
      tag: 'test',
      userId: '1234567890',
    };

    const createNoteStub = sinon
      .stub(Note, 'create')
      .rejects('Some specific error');

    try {
      const res = await chai.request(app).post('/api/v1/notes').send(noteData);
      expect(res).to.have.status(500);
      expect(res.body).to.have.property('error');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      createNoteStub.restore();
    }
  });
});

// put note
describe('PUT /updateNote - Update a Note', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should update a note with valid data', async () => {
    const noteId = '6594264312612ca76fceee23';
    const updateData = {
      title: 'Updated Note Title',
      description: 'Updated description',
      tag: 'updatedTag',
    };

    const noteSaveStub = sinon.stub().resolves({
      _id: noteId,
      ...updateData,
      save: sinon.stub().resolves(),
    });

    sinon.stub(Note, 'findById').resolves({
      _id: noteId,
      ...updateData,
      save: noteSaveStub,
    });

    sinon.stub(Note, 'findOneAndUpdate').callsFake(() => ({
      exec: () => noteSaveStub,
    }));

    const res = await chai
      .request(app)
      .put(`/api/v1/notes/updateNote`)
      .send({ id: noteId, ...updateData });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('note');
    expect(res.body.note.title).to.equal(updateData.title);
  });

  it('should return an error if note update fails', async () => {
    const noteId = '6594264312612ca76fceee23';
    const updateData = {
      title: 'Updated Note Title',
      description: 'Updated description',
      tag: 'updatedTag',
    };

    const noteSaveStub = sinon.stub().rejects();

    sinon.stub(Note, 'findById').resolves({
      _id: noteId,
      ...updateData,
      save: noteSaveStub,
    });

    sinon.stub(Note, 'findOneAndUpdate').callsFake(() => ({
      exec: () => noteSaveStub,
    }));

    const res = await chai
      .request(app)
      .put(`/api/v1/notes/updateNote`)
      .send({ id: noteId, ...updateData });

    expect(res).to.have.status(500);
  });
});

// delete note
describe('DELETE /deleteNote - Delete a Note', () => {
  it('should delete a note with valid ID', async () => {
    const validNoteId = '6594264312612ca76fceee23';
    const noteStub = sinon
      .stub(Note, 'findById')
      .resolves({ _id: validNoteId });

    const deleteStub = sinon.stub(Note, 'findByIdAndDelete').resolves({
      _id: validNoteId,
    });

    const res = await chai
      .request(app)
      .delete(`/api/v1/notes/deleteNote`)
      .send({ id: validNoteId });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('note');
    expect(res.body.note._id).to.equal(validNoteId);
    expect(res.body).to.have.property('message', 'Note deleted successfully');

    noteStub.restore();
    deleteStub.restore();
  });

  it('should return an error if note deletion fails', async () => {
    const validNoteId = '6594264312612ca76fceee23';
    const noteStub = sinon
      .stub(Note, 'findById')
      .resolves({ _id: validNoteId });

    const deleteStub = sinon.stub(Note, 'findByIdAndDelete').rejects();

    const res = await chai
      .request(app)
      .delete(`/api/v1/notes/deleteNote`)
      .send({ id: validNoteId });

    expect(res).to.have.status(500);
    noteStub.restore();
    deleteStub.restore();
  });
});

// get all note
describe('GET / - Get All Notes', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve all notes for a valid user ID', async () => {
    const validUserId = '6594264312612ca76fceee23';
    const expectedNotes = [
      // Mocked notes data for the user ID
      {
        _id: 'note1',
        title: 'Note 1',
        description: 'Description 1',
        tag: 'tag1',
        userId: validUserId,
      },
      {
        _id: 'note2',
        title: 'Note 2',
        description: 'Description 2',
        tag: 'tag2',
        userId: validUserId,
      },
    ];

    const findStub = sinon
      .stub(Note, 'find')
      .withArgs({ userId: validUserId })
      .resolves(expectedNotes);

    const res = await chai
      .request(app)
      .get(`/api/v1/notes`)
      .send({ userId: validUserId });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('notes');
    expect(res.body.notes)
      .to.be.an('array')
      .with.lengthOf(expectedNotes.length);
    expect(findStub.calledOnce).to.be.true;
  });

  it('should return an empty array if no notes are found for the user', async () => {
    const invalidUserId = '6594ca76fceee23';

    const findStub = sinon
      .stub(Note, 'find')
      .withArgs({ userId: invalidUserId })
      .resolves([]);

    const res = await chai
      .request(app)
      .get(`/api/v1/notes`)
      .send({ userId: invalidUserId });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('notes').that.is.an('array').and.is.empty;
  });
});

// retrive data by note id
describe('GET /getNote - Get Note by ID', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve a note with a valid ID', async () => {
    const validNoteId = '6594264312612ca76fceee23';
    const expectedNote = {
      _id: validNoteId,
      title: 'Sample Note',
      description: 'This is a sample note',
    };

    const findOneStub = sinon
      .stub(Note, 'findOne')
      .withArgs({ _id: validNoteId })
      .resolves(expectedNote);

    const res = await chai
      .request(app)
      .get(`/api/v1/notes/getNote`)
      .send({ id: validNoteId });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('note');
    expect(res.body.note).to.deep.equal(expectedNote);
    expect(findOneStub.calledOnce).to.be.true;
  });

  it('should return an error if no note is found for the given ID', async () => {
    const invalidNoteId = '6594264312612ca'; // Invalid note ID

    const findOneStub = sinon
      .stub(Note, 'findOne')
      .withArgs({ _id: invalidNoteId })
      .resolves(null);

    const res = await chai
      .request(app)
      .get(`/api/v1/notes/getNote`)
      .send({ id: invalidNoteId });

    expect(res).to.have.status(500);
  });
});
