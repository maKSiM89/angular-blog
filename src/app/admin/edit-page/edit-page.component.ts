import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {PostService} from '../../shared/post.service';
import {switchMap} from 'rxjs/operators';
import {Post} from '../../shared/interfaces';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {AlertService} from '../shared/services/alert.service';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.scss']
})
export class EditPageComponent implements OnInit, OnDestroy {
  form: FormGroup;
  post: Post;
  submitted = false;

  private updateSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap((params: Params) => {
        return this.postService.getByID(params.id);
      })
    ).subscribe((post: Post) => {
      this.post = post;
      this.form = new FormGroup({
        title: new FormControl(post.title, [Validators.required]),
        text: new FormControl(post.text, [Validators.required])
      });
    });
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.submitted = true;

    this.updateSubscription = this.postService.update({
      ...this.post,
      id: this.post.id,
      text: this.form.value.text,
      title: this.form.value.title
    }).subscribe(() => {
      this.submitted = true;
      this.alertService.warning('Post was updated');
    }, () => {
      this.submitted = true;
    });
  }
}
